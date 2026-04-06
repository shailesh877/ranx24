import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoice = (booking) => {
  const doc = new jsPDF('p', 'pt', 'a4');

  // Colors
  const primaryColor = [59, 130, 246]; // Blue-600
  const textColor = [51, 51, 51];

  // Header Section
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 40, 60);

  // RanX24 Details (Right Side)
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.setFont("helvetica", "bold");
  doc.text("RanX24 Services", 555, 50, { align: 'right' });
  
  doc.setFont("helvetica", "normal");
  doc.text("Phone: +91 9546806196", 555, 65, { align: 'right' });
  doc.text("Email: support@ranx24.com", 555, 80, { align: 'right' });
  doc.text("GSTIN: 10HLOPK0466G1Z6", 555, 95, { align: 'right' });
  doc.text("Shubhankarpur, Patahi", 555, 110, { align: 'right' });
  doc.text("Muzaffarpur, Bihar 843113", 555, 125, { align: 'right' });

  // Divider Line
  doc.setDrawColor(220, 220, 220);
  doc.line(40, 140, 555, 140);

  // Booking details & Customer Info
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice To:", 40, 165);
  doc.text("Invoice Details:", 350, 165);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Customer details
  const customerName = booking.address?.name || 'Customer';
  const customerMobile = booking.address?.mobileNumber || 'N/A';
  const street = booking.address?.street || '';
  const city = booking.address?.city || '';
  const state = booking.address?.state || '';
  const zip = booking.address?.zipCode || '';
  
  let leftY = 185;
  doc.text(`Name: ${customerName}`, 40, leftY);
  leftY += 15;
  doc.text(`Phone: ${customerMobile}`, 40, leftY);
  leftY += 15;
  
  if (street) {
    const streetLines = doc.splitTextToSize(street, 250);
    doc.text(streetLines, 40, leftY);
    leftY += (15 * streetLines.length);
  }
  
  if (city || state) {
    doc.text(`${city}, ${state} ${zip}`, 40, leftY);
    leftY += 15;
  }

  // Invoice specifics
  const invoiceDate = new Date().toLocaleDateString();
  const bookingDate = new Date(booking.bookingDate).toLocaleDateString();
  
  let rightY = 185;
  doc.text(`Invoice No: INV-${booking._id.slice(-8).toUpperCase()}`, 350, rightY);
  rightY += 15;
  doc.text(`Invoice Date: ${invoiceDate}`, 350, rightY);
  rightY += 15;
  doc.text(`Service Date: ${bookingDate}`, 350, rightY);
  rightY += 15;
  doc.text(`Payment Status: ${booking.paymentStatus === 'paid' ? 'PAID' : booking.paymentStatus.toUpperCase()}`, 350, rightY);
  rightY += 15;

  const tableStartY = Math.max(leftY, rightY) + 20;

  // Prices Calculation
  const basePrice = booking.price || 0;
  const platformFee = booking.platformFee || 0;
  const percentageFee = booking.percentageFee || 0;
  const subtotal = basePrice + platformFee + percentageFee;
  
  const discount = (booking.couponDiscount || 0) + (booking.membershipDiscount || 0) + (booking.coinDiscount || 0);
  
  // Calculate GST on discounted amount
  const subtotalAfterDiscount = Math.max(0, subtotal - discount);
  const gstAmount = booking.gstAmount || Math.round(subtotalAfterDiscount * 0.18); 
  const displayGstAmount = gstAmount;

  // We recalculate final total based on what we show, but booking.finalPrice is source of truth
  const finalPrice = subtotalAfterDiscount + displayGstAmount;

  // Data for table
  const tableData = [
    [
      booking.service || 'Service',
      booking.category || 'Standard',
      `Rs. ${basePrice.toLocaleString()}`
    ]
  ];

  if (platformFee > 0 || percentageFee > 0) {
    tableData.push([
      'Service & Platform Fees',
      '-',
      `Rs. ${(platformFee + percentageFee).toLocaleString()}`
    ]);
  }

  // Table
  autoTable(doc, {
    startY: tableStartY,
    head: [['Service Description', 'Category', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 8 },
    columnStyles: {
      0: { cellWidth: 260 },
      1: { cellWidth: 155 },
      2: { cellWidth: 100, halign: 'right' }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 20;

  // Totals Section
  doc.setFontSize(10);
  
  // Subtotal
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal:", 390, finalY);
  doc.text(`Rs. ${subtotal.toLocaleString()}`, 555, finalY, { align: 'right' });

  // Disocunts
  let nextY = finalY;
  if (discount > 0) {
    nextY += 15;
    doc.setTextColor(0, 128, 0);
    doc.text("Discount:", 390, nextY);
    doc.text(`-Rs. ${discount.toLocaleString()}`, 555, nextY, { align: 'right' });
    doc.setTextColor(...textColor);
  }

  // GST
  nextY += 15;
  doc.text("GST (18%):", 390, nextY);
  doc.text(`Rs. ${displayGstAmount.toLocaleString()}`, 555, nextY, { align: 'right' });

  // Total
  nextY += 15;
  doc.setDrawColor(200);
  doc.line(390, nextY - 5, 555, nextY - 5);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total Paid:", 390, nextY + 10);
  doc.text(`Rs. ${finalPrice.toLocaleString()}`, 555, nextY + 10, { align: 'right' });

  doc.line(390, nextY + 18, 555, nextY + 18);

  // Footer Message
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text("Thank you for choosing RanX24 Services!", 297, nextY + 60, { align: 'center' });
  doc.text("This is a computer generated invoice and requires no signature.", 297, nextY + 75, { align: 'center' });

  // Save the PDF
  doc.save(`Invoice_RanX24_${booking._id.slice(-8)}.pdf`);
};
