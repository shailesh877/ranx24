import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Platform, Alert } from 'react-native';

export const generateInvoice = async (booking: any) => {
    const customerName = booking.address?.name || 'Customer';
    const customerMobile = booking.address?.mobileNumber || 'N/A';
    const street = booking.address?.street || '';
    const city = booking.address?.city || '';
    const state = booking.address?.state || '';
    const zip = booking.address?.zipCode || '';

    const invoiceDate = new Date().toLocaleDateString();
    const bookingDate = new Date(booking.bookingDate).toLocaleDateString();

    const basePrice = booking.price || 0;
    const platformFee = booking.platformFee || 0;
    const percentageFee = booking.percentageFee || 0;
    const subtotal = basePrice + platformFee + percentageFee;
    const discount = (booking.couponDiscount || 0) + (booking.membershipDiscount || 0) + (booking.coinDiscount || 0);
    const subtotalAfterDiscount = Math.max(0, subtotal - discount);
    const gstAmount = booking.gstAmount || Math.round(subtotalAfterDiscount * 0.18);
    const finalPrice = subtotalAfterDiscount + gstAmount;

    const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; padding: 20px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
          .title { font-size: 28px; font-weight: bold; color: #3b82f6; }
          .company-details { text-align: right; font-size: 10px; line-height: 1.4; }
          .details-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .details-box { width: 45%; }
          .details-title { font-size: 12px; font-weight: bold; margin-bottom: 10px; }
          .details-text { font-size: 10px; line-height: 1.5; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background-color: #3b82f6; color: white; text-align: left; padding: 10px; font-size: 12px; }
          td { border: 1px solid #eee; padding: 10px; font-size: 10px; }
          .totals { margin-left: auto; width: 40%; }
          .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 11px; }
          .total-row.grand-total { border-top: 1px solid #333; margin-top: 10px; padding-top: 10px; font-weight: bold; font-size: 14px; }
          .footer { text-align: center; margin-top: 50px; font-size: 10px; color: #999; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">INVOICE</div>
          <div class="company-details">
            <strong>RanX24 Services</strong><br/>
            Phone: +91 9546806196<br/>
            Email: support@ranx24.com<br/>
            GSTIN: 10HLOPK0466G1Z6<br/>
            Shubhankarpur, Patahi<br/>
            Muzaffarpur, Bihar 843113
          </div>
        </div>

        <div class="details-section">
          <div class="details-box">
            <div class="details-title">Invoice To:</div>
            <div class="details-text">
              Name: ${customerName}<br/>
              Phone: ${customerMobile}<br/>
              ${street}<br/>
              ${city}, ${state} ${zip}
            </div>
          </div>
          <div class="details-box" style="text-align: right;">
            <div class="details-title">Invoice Details:</div>
            <div class="details-text">
              Invoice No: INV-${booking._id.slice(-8).toUpperCase()}<br/>
              Invoice Date: ${invoiceDate}<br/>
              Service Date: ${bookingDate}<br/>
              Status: ${booking.paymentStatus.toUpperCase()}
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Service Description</th>
              <th>Category</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${booking.service || 'Service'}</td>
              <td>${booking.category || 'Standard'}</td>
              <td style="text-align: right;">Rs. ${basePrice.toLocaleString()}</td>
            </tr>
            ${(platformFee + percentageFee) > 0 ? `
            <tr>
              <td>Service & Platform Fees</td>
              <td>-</td>
              <td style="text-align: right;">Rs. ${(platformFee + percentageFee).toLocaleString()}</td>
            </tr>` : ''}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>Rs. ${subtotal.toLocaleString()}</span>
          </div>
          ${discount > 0 ? `
          <div class="total-row" style="color: green;">
            <span>Discount:</span>
            <span>-Rs. ${discount.toLocaleString()}</span>
          </div>` : ''}
          <div class="total-row">
            <span>GST (18%):</span>
            <span>Rs. ${gstAmount.toLocaleString()}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total Paid:</span>
            <span>Rs. ${finalPrice.toLocaleString()}</span>
          </div>
        </div>

        <div class="footer">
          Thank you for choosing RanX24 Services!<br/>
          This is a computer generated invoice and requires no signature.
        </div>
      </body>
    </html>
    `;

    try {
        const { uri } = await Print.printToFileAsync({ html });
        const fileName = `Invoice_${booking._id.slice(-8).toUpperCase()}.pdf`;

        const SAF = (FileSystem as any).StorageAccessFramework;

        if (Platform.OS === 'android' && SAF) {
            const permissions = await SAF.requestDirectoryPermissionsAsync();
            if (permissions.granted) {
                const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
                await SAF.createFileAsync(permissions.directoryUri, fileName, 'application/pdf')
                    .then(async (newUri: string) => {
                        await FileSystem.writeAsStringAsync(newUri, base64, { encoding: FileSystem.EncodingType.Base64 });
                        Alert.alert("Success", "Invoice downloaded successfully to your selected folder!");
                    })
                    .catch((e: any) => {
                        console.log(e);
                        Sharing.shareAsync(uri);
                    });
            } else {
                await Sharing.shareAsync(uri);
            }
        } else {
            // iOS or Android without SAF support - Sharing is the standard way
            await Sharing.shareAsync(uri);
        }
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};
