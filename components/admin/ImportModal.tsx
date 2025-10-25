'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X,
  Download,
  Eye,
  MapPin
} from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (data: any[], mapping: ColumnMapping) => Promise<void>
}

interface ColumnMapping {
  product_ref: string
  bf_price: string
}

interface ImportData {
  [key: string]: string | number
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing'>('upload')
  const [csvData, setCsvData] = useState<ImportData[]>([])
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<ColumnMapping>({
    product_ref: '',
    bf_price: ''
  })
  const [previewData, setPreviewData] = useState<ImportData[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      setError('Please select a CSV file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        
        if (lines.length < 2) {
          setError('CSV file must have at least a header row and one data row')
          return
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        const data: ImportData[] = []

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
          if (values.length === headers.length) {
            const row: ImportData = {}
            headers.forEach((header, index) => {
              row[header] = values[index]
            })
            data.push(row)
          }
        }

        setCsvHeaders(headers)
        setCsvData(data)
        setError('')
        setStep('mapping')
      } catch (err) {
        setError('Error parsing CSV file')
        console.error('CSV parsing error:', err)
      }
    }
    reader.readAsText(file)
  }

  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    setMapping(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePreview = () => {
    if (!mapping.product_ref || !mapping.bf_price) {
      setError('Please map both required fields')
      return
    }

    const preview = csvData.slice(0, 10).map(row => ({
      product_ref: row[mapping.product_ref],
      bf_price: row[mapping.bf_price]
    })).filter(item => item.product_ref && item.bf_price)

    setPreviewData(preview)
    setError('')
    setStep('preview')
  }

  const handleImport = async () => {
    setIsLoading(true)
    setStep('importing')
    
    try {
      const importData = csvData.map(row => ({
        product_ref: row[mapping.product_ref],
        bf_price: row[mapping.bf_price]
      })).filter(item => item.product_ref && item.bf_price)

      await onImport(importData, mapping)
      onClose()
      resetModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
      setStep('preview')
    } finally {
      setIsLoading(false)
    }
  }

  const resetModal = () => {
    setStep('upload')
    setCsvData([])
    setCsvHeaders([])
    setMapping({ product_ref: '', bf_price: '' })
    setPreviewData([])
    setError('')
    setIsLoading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  const downloadTemplate = () => {
    const template = 'product_ref,bf_price\n420.20.047,10990\n420.20.048,7990\n420.20.046,12990'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'black-friday-prices-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Black Friday Prices
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4">
            {[
              { key: 'upload', label: 'Upload', icon: Upload },
              { key: 'mapping', label: 'Map Columns', icon: MapPin },
              { key: 'preview', label: 'Preview', icon: Eye },
              { key: 'importing', label: 'Import', icon: CheckCircle }
            ].map((stepItem, index) => {
              const Icon = stepItem.icon
              const isActive = step === stepItem.key
              const isCompleted = ['upload', 'mapping', 'preview', 'importing'].indexOf(step) > index
              
              return (
                <div key={stepItem.key} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    isActive ? 'bg-blue-600 text-white' : 
                    isCompleted ? 'bg-green-600 text-white' : 
                    'bg-gray-200 text-gray-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`ml-2 text-sm ${
                    isActive ? 'text-blue-600 font-medium' : 
                    isCompleted ? 'text-green-600' : 
                    'text-gray-500'
                  }`}>
                    {stepItem.label}
                  </span>
                  {index < 3 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Upload Step */}
          {step === 'upload' && (
            <div className="space-y-4">
              <Card className="p-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Upload CSV File</h3>
                    <p className="text-gray-600">Select a CSV file with product references and Black Friday prices</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                      variant="outline"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose CSV File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    <Button
                      onClick={downloadTemplate}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Mapping Step */}
          {step === 'mapping' && (
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Map CSV Columns</h3>
                <p className="text-gray-600 mb-4">
                  Map your CSV columns to the required fields. Found {csvHeaders.length} columns in your file.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="product_ref">Product Reference</Label>
                    <Select
                      value={mapping.product_ref}
                      onValueChange={(value) => handleMappingChange('product_ref', value)}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="Select column for product reference" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-300 shadow-lg">
                        {csvHeaders.map(header => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="bf_price">Black Friday Price</Label>
                    <Select
                      value={mapping.bf_price}
                      onValueChange={(value) => handleMappingChange('bf_price', value)}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="Select column for Black Friday price" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-300 shadow-lg">
                        {csvHeaders.map(header => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button onClick={handlePreview} className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Data
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Preview Step */}
          {step === 'preview' && (
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Preview Import Data</h3>
                <p className="text-gray-600 mb-4">
                  Review the data that will be imported. Showing first 10 rows.
                </p>
                
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Reference</TableHead>
                        <TableHead>Black Friday Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">{row.product_ref}</TableCell>
                          <TableCell className="font-mono text-sm">{row.bf_price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Total rows to import: {csvData.length}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep('mapping')}>
                      Back to Mapping
                    </Button>
                    <Button onClick={handleImport}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Import Data
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Importing Step */}
          {step === 'importing' && (
            <div className="space-y-4">
              <Card className="p-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Importing Data</h3>
                    <p className="text-gray-600">Please wait while we update the Black Friday prices...</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800">Error</h4>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError('')}
                className="ml-auto text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
