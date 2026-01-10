import React from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../components/ui/alert-dialog";
import { Toast, ToastDescription, ToastTitle, ToastAction, ToastProvider, ToastViewport } from "../components/ui/toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  CreditCard,
  Wallet,
  Coins,
  Bitcoin,
  CreditCardIcon,
  Check,
  Plus,
  Building2 as Bank,
  AlertTriangle,
  Copy,
  X,
  QrCode,
  RefreshCw
} from "lucide-react";
import { useDeposit } from "../hooks/us/useDeposit";

// Simular imágenes QR code para cada método de pago
const QR_PLACEHOLDERS = {
  bank: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmMWYxZjEiLz48cGF0aCBkPSJNNjAgNjBoMjB2MjBINjB6TTgwIDYwaDIwdjIwSDgwek0xMDAgNjBoMjB2MjBoLTIwek0xMjAgNjBoMjB2MjBoLTIwek02MCA4MGgyMHYyMEg2MHpNMTIwIDgwaDIwdjIwaC0yMHpNNjAgMTAwaDIwdjIwSDYwek0xMjAgMTAwaDIwdjIwaC0yMHpNNjAgMTIwaDIwdjIwSDYwek04MCAxMjBoMjB2MjBIODB6TTEwMCAxMjBoMjB2MjBoLTIwek0xMjAgMTIwaDIwdjIwaC0yMHoiIGZpbGw9IiMzMzMiLz48L3N2Zz4=",
  paypal: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMwMDllYzkiLz48cGF0aCBkPSJNNjAgNjBoMjB2MjBINjB6TTgwIDYwaDIwdjIwSDgwek0xMDAgNjBoMjB2MjBoLTIwek0xMjAgNjBoMjB2MjBoLTIwek02MCA4MGgyMHYyMEg2MHpNMTIwIDgwaDIwdjIwaC0yMHpNNjAgMTAwaDIwdjIwSDYwek0xMjAgMTAwaDIwdjIwaC0yMHpNNjAgMTIwaDIwdjIwSDYwek04MCAxMjBoMjB2MjBIODB6TTEwMCAxMjBoMjB2MjBoLTIwek0xMjAgMTIwaDIwdjIwaC0yMHoiIGZpbGw9IndoaXRlIi8+PC9zdmc+",
  crypto: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmZmFhMDAiLz48cGF0aCBkPSJNNjAgNjBoMjB2MjBINjB6TTgwIDYwaDIwdjIwSDgwek0xMDAgNjBoMjB2MjBoLTIwek0xMjAgNjBoMjB2MjBoLTIwek02MCA4MGgyMHYyMEg2MHpNMTIwIDgwaDIwdjIwaC0yMHpNNjAgMTAwaDIwdjIwSDYwek0xMjAgMTAwaDIwdjIwaC0yMHpNNjAgMTIwaDIwdjIwSDYwek04MCAxMjBoMjB2MjBIODB6TTEwMCAxMjBoMjB2MjBoLTIwek0xMjAgMTIwaDIwdjIwaC0yMHoiIGZpbGw9IiMzMzMiLz48L3N2Zz4="
};

export default function DepositPage() {
  // Sử dụng useDeposit hook để quản lý tất cả state và logic của trang
  const {
    // Data
    balance,
    transactionHistory,
    isLoadingTransactions,
    paymentInfo,
    fees,
    presetAmounts,
    
    // State
    selectedAmount,
    customAmount,
    totalAmount,
    fee,
    selectedPaymentMethod,
    showPaymentInfo,
    showQRCode,
    isProcessingPayment,
    currentTransactionId,
    
    // Actions
    handleAmountSelect,
    handleCustomAmountChange,
    handlePaymentMethodChange,
    handleConfirmPayment,
    handleClosePaymentInfo,
    checkPaymentStatus,
    copyToClipboard,
    toggleQRCode,
    
    // Mutations status
    isCreatingDeposit,
    isProcessingPaymentMutation
  } = useDeposit();

  return (
    <>
      <div className="mb-6">
        <div className="w-full bg-gradient-to-r from-blue-700 to-blue-500 rounded-lg overflow-hidden mb-6">
          <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-white text-sm font-medium opacity-90">Información de cuenta</p>
              <h2 className="text-white text-xl font-bold mt-1">Saldo</h2>
            </div>
            <div className="text-right">
              <p className="text-white text-sm font-medium opacity-90">Total:</p>
              <h2 className="text-white text-4xl font-bold">${balance.amount.toFixed(2)}</h2>
            </div>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Depositar en la cuenta</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Agregar dinero a la cuenta para usar en proxies, perfiles y otros servicios
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar método de pago</CardTitle>
              <CardDescription>Elige cómo deseas depositar dinero en tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedPaymentMethod} onValueChange={handlePaymentMethodChange} className="space-y-4">
                <div className={`flex items-center border rounded-lg p-4 ${selectedPaymentMethod === 'bank' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                  <RadioGroupItem value="bank" id="bank" className="mr-4" />
                  <Label htmlFor="bank" className="flex-1 flex items-center cursor-pointer">
                    <Bank className="h-5 w-5 mr-3 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-medium">Transferencia bancaria</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Transferencia a través de banco o aplicación mobile banking</p>
                    </div>
                  </Label>
                </div>
                
                <div className={`flex items-center border rounded-lg p-4 ${selectedPaymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                  <RadioGroupItem value="paypal" id="paypal" className="mr-4" />
                  <Label htmlFor="paypal" className="flex-1 flex items-center cursor-pointer">
                    <Wallet className="h-5 w-5 mr-3 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-medium">PayPal</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Pago seguro con cuenta PayPal</p>
                    </div>
                  </Label>
                </div>
                
                <div className={`flex items-center border rounded-lg p-4 ${selectedPaymentMethod === 'crypto' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                  <RadioGroupItem value="crypto" id="crypto" className="mr-4" />
                  <Label htmlFor="crypto" className="flex-1 flex items-center cursor-pointer">
                    <Bitcoin className="h-5 w-5 mr-3 text-orange-500" />
                    <div>
                      <p className="font-medium">Criptomoneda</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Pago con Bitcoin, Ethereum o USDT</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
              
              <div className="mt-6">
                <Alert className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <AlertTitle>Nota al pagar</AlertTitle>
                  <AlertDescription className="text-sm">
                    Por favor, verifica cuidadosamente la información de pago antes de realizar la transacción. Después de transferir el dinero, contáctanos por Telegram o Email si necesitas soporte.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Cantidad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {presetAmounts.map((amount) => (
                  <Button
                    key={amount.value}
                    variant={selectedAmount === amount.value ? "default" : "outline"}
                    className="h-12"
                    onClick={() => handleAmountSelect(amount.value)}
                  >
                    {amount.label}
                  </Button>
                ))}
              </div>
              
              <div className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="customAmount">Otra cantidad (USD):</Label>
                  <Input
                    id="customAmount"
                    type="number"
                    placeholder="Ingresa la cantidad"
                    min="1"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="mt-1"
                  />
                </div>
                
                <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Cantidad:</span>
                    <span className="font-medium">${(selectedAmount || parseFloat(customAmount) || 0).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Comisión de transacción:</span>
                    <span className="font-medium">${fee.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Total a pagar:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                onClick={handleConfirmPayment}
                disabled={totalAmount <= 0}
              >
                Confirmar pago
              </Button>
              <Button variant="ghost" className="w-full">
                Cancelar
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Lịch sử giao dịch</CardTitle>
          <CardDescription>Các giao dịch gần đây của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactionHistory.map((transaction) => (
              <div key={transaction.id} className="border-b pb-4 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{transaction.type}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.method} - {transaction.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{transaction.amount.toLocaleString('vi-VN')} đ</span>
                    <div className={`flex items-center ${
                      transaction.status === 'completed' 
                        ? 'text-green-600 dark:text-green-400' 
                        : transaction.status === 'pending'
                          ? 'text-orange-500 dark:text-orange-300'
                          : 'text-red-500 dark:text-red-400'
                    } text-sm mt-1`}>
                      {transaction.status === 'completed' ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : transaction.status === 'pending' ? (
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <X className="h-3 w-3 mr-1" />
                      )}
                      {transaction.status === 'completed' 
                        ? 'Completado' 
                        : transaction.status === 'pending'
                          ? 'Procesando'
                          : 'Fallido'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Diálogo que muestra información de pago */}
      <AlertDialog open={showPaymentInfo} onOpenChange={handleClosePaymentInfo}>
        <AlertDialogContent className="max-w-2xl p-0 overflow-hidden">
          <AlertDialogHeader className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <AlertDialogTitle className="text-xl font-medium">
              {paymentInfo[selectedPaymentMethod as keyof typeof paymentInfo].title}
            </AlertDialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowPaymentInfo(false)}
              className="text-white hover:bg-blue-700 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </AlertDialogHeader>
          
          <AlertDialogDescription>
            <div className="flex flex-col md:flex-row">
              {/* Código QR parte izquierda */}
              <div className="md:w-2/5 bg-gray-50 dark:bg-gray-800 p-6 flex flex-col items-center justify-start">
                <div className="mb-4">
                  <h3 className="text-center font-medium text-lg mb-2">Seleccionar método de pago</h3>
                  <div className="flex space-x-2 justify-center">
                    {selectedPaymentMethod === 'bank' && (
                      <Button size="sm" variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                        MB Bank
                      </Button>
                    )}
                    {selectedPaymentMethod === 'paypal' && (
                      <Button size="sm" variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                        PayPal
                      </Button>
                    )}
                    {selectedPaymentMethod === 'crypto' && (
                      <Button size="sm" variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                        Bitcoin
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow mb-3 border border-gray-200">
                  <img 
                    src={QR_PLACEHOLDERS[selectedPaymentMethod as keyof typeof QR_PLACEHOLDERS]} 
                    alt="QR Code" 
                    className="w-full h-auto max-w-[180px]"
                  />
                </div>
                
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-[250px]">
                  Escanea el código QR con la aplicación {selectedPaymentMethod === 'bank' ? 'del banco' : selectedPaymentMethod === 'paypal' ? 'PayPal' : 'de billetera de criptomoneda'} para pagar rápidamente
                </div>
              </div>
              
              {/* Detalles de pago a la derecha */}
              <div className="md:w-3/5 p-6">
                <div className="space-y-4">
                  {/* Información bancaria/método */}
                  {selectedPaymentMethod === 'bank' && (
                    <div className="mb-5">
                      <div className="flex items-center mb-2">
                        <Bank className="h-5 w-5 mr-2 text-blue-600" />
                        <span className="font-medium">Banco:</span>
                        <span className="ml-2 text-blue-600 font-medium">MB Bank</span>
                      </div>
                      
                      <div className="mb-2">
                        <span className="font-medium">Titular de cuenta:</span>
                        <span className="ml-2 text-blue-600 font-medium">CÔNG TY TNHH ANTI DETECT</span>
                      </div>
                      
                      <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded mb-2">
                        <span className="text-base font-medium">Número de cuenta:</span>
                        <div className="flex items-center">
                          <span className="text-blue-600 font-medium mr-2">8068888288888</span>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard("8068888288888")} className="h-8 w-8 p-0">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded">
                        <span className="text-base font-medium">Contenido de transferencia:</span>
                        <div className="flex items-center">
                          <span className="text-blue-600 font-medium mr-2">NAPTHE {currentTransactionId}</span>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`NAPTHE ${currentTransactionId}`)} className="h-8 w-8 p-0">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Si es otro método */}
                  {selectedPaymentMethod !== 'bank' && (
                    <div className="space-y-3 mb-5">
                      {paymentInfo[selectedPaymentMethod as keyof typeof paymentInfo].content.map((line, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded">
                          <span className="text-base">{line}</span>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(line)} className="h-8 w-8 p-0">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Detalles de pago */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800">
                    <div className="font-medium text-blue-700 dark:text-blue-300 mb-3 text-lg">Detalles de transacción:</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-base">
                        <span>Cantidad:</span>
                        <span>${(selectedAmount || parseFloat(customAmount) || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-base">
                        <span>Comisión de transacción:</span>
                        <span>${fee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium mt-3 pt-3 border-t border-blue-200 dark:border-blue-700 text-lg">
                        <span>Total:</span>
                        <span className="text-blue-600">${totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium text-base">
                        <span>Equivalente:</span>
                        <span>{(totalAmount * 25000).toLocaleString('es-ES')} VND</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Nota */}
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <div className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                      <p>Si realizas la transacción según la información correcta de la cuenta, se agregará automáticamente después de que la transacción sea exitosa</p>
                    </div>
                    <div className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                      <p>En caso de que pasen más de 10 minutos después de una transacción exitosa y tu cuenta aún no haya sido actualizada, por favor contacta al servicio al cliente</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              <Button variant="outline" onClick={() => setShowPaymentInfo(false)} className="text-base">
                Cerrar
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-base text-white"
                onClick={checkPaymentStatus}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "He pagado"
                )}
              </Button>
            </div>
          </AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
