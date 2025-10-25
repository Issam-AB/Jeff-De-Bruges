import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    let csvText = ''
    
    // Check if CSV data is provided in the request body (manual upload)
    if (body.csvData) {
      // If csvData is provided, it's already formatted as CSV text
      csvText = body.csvData
    } else {
      // Google Sheets API endpoint for the specific sheet
      const SHEET_ID = '1QOTOtjj-X_RUPiGEbO0ToV1HySUX_jSqcJxghPQ6z3E'
      
      // Try multiple methods to access the Google Sheets data
      const csvUrls = [
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`,
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`,
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0&single=true&output=csv`
      ]
      
      let fetchSuccess = false
      
      // Try each URL until one works
      for (const csvUrl of csvUrls) {
        try {
          const response = await fetch(csvUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          })
          
          if (response.ok) {
            csvText = await response.text()
            // Check if we got actual CSV data or HTML error page
            if (csvText.includes('product_ref') || csvText.includes('bf_price') || csvText.split('\n').length > 2) {
              fetchSuccess = true
              break
            }
          }
        } catch (error) {
          console.log(`Failed to fetch from ${csvUrl}:`, error)
          continue
        }
      }
      
      if (!fetchSuccess) {
        throw new Error('Unable to access Google Sheets data. Please ensure the sheet is publicly accessible or provide CSV data manually.')
      }
    }
    
    const lines = csvText.split('\n').filter(line => line.trim())
    
    // Skip header row and parse data
    const priceData: { product_ref: string; bf_price: number }[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      // Handle CSV parsing more robustly
      const columns = line.split(',').map(col => col.trim().replace(/"/g, ''))
      if (columns.length >= 2) {
        const product_ref = columns[0]
        const bf_price = columns[1]
        
        if (product_ref && bf_price && !isNaN(Number(bf_price))) {
          priceData.push({
            product_ref: product_ref,
            bf_price: Number(bf_price)
          })
        }
      }
    }
    
    // Update products in database
    let updatedCount = 0
    let notFoundCount = 0
    
    for (const item of priceData) {
      try {
        const result = await prisma.product.updateMany({
          where: { ref: item.product_ref },
          data: { VenteflashPrice: item.bf_price }
        })
        
        if (result.count > 0) {
          updatedCount++
        } else {
          notFoundCount++
        }
      } catch (error) {
        console.error(`Error updating product ${item.product_ref}:`, error)
        notFoundCount++
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedCount} products. ${notFoundCount} products not found.`,
      updatedCount,
      notFoundCount,
      totalProcessed: priceData.length
    })
    
  } catch (error) {
    console.error('Error updating black friday prices:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update black friday prices',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
