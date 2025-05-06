import { convertPriceToDisplay } from "./helpers.mjs";

export const getStartJobHTML = (
  name,
  invoiceNumber,
  services,
  subtotal,
  taxAndFeesTotal,
  total,
  location,
  orgPhone,
  orgEmail,
  orgName,
  date
) => {
  let servicesText = ``;
  services.forEach((s) => {
    servicesText += `${s.name} ${
      s.description ? `- ${s.description}` : ``
    }<br>`;
    servicesText +=
      s.rate === "flat"
        ? `&nbsp;&nbsp;&nbsp;&nbsp;${s.quantity} x $${convertPriceToDisplay(
            s.price
          ).toFixed(2)}<br>`
        : `&nbsp;&nbsp;&nbsp;&nbsp;${s.quantity} ${
            s.quantity > 1 ? "hours" : "hour"
          } @ $${convertPriceToDisplay(s.price).toFixed(2)}/hr<br>`;
    if (s.taxesAndFees?.length > 0) {
      servicesText += `Applicable Taxes and Fees<br>`;
      s.taxesAndFees.forEach((tf) => {
        servicesText +=
          tf.type === "flat"
            ? `&nbsp;&nbsp;&nbsp;&nbsp;${tf.name} - $${convertPriceToDisplay(
                tf.amount
              ).toFixed(2)}<br>`
            : `&nbsp;&nbsp;&nbsp;&nbsp;${tf.name} - ${tf.amount}%<br>`;
      });
    }
    servicesText += `<br>`;
  });

  let dateText = ``;
  if (date.type === "single") {
    dateText += `on ${date.startDate.dateString}`;
  } else if (date.type === "multi") {
    dateText += `for ${date.startDate.dateString} to ${date.endDate.dateString}`;
  }
  return `<html lang="en">
        <head>
        <meta charset="UTF-8">
        <title>Service Booking Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px; color: #333;">
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            
            <a href="your-image-link-here.png">
            <img src="your-image-link-here.png" alt="Logo" style="display: block; margin: 0 auto; max-width: 150px;">
            </a>
            
            <h2 style="color: #4a90e2;">Hi <em>${name}</em>,</h2>
            <p>
            Please find your booked service(s) and details ${dateText} below.
            You will receive an invoice and payment details once we have completed your service.
            </p>

            <p><strong>Invoice Number: </strong>${invoiceNumber}</p>

            <h3 style="margin-top: 30px;">Service Location</h3>            
            <p>
            ${
              location.unitNumber
                ? `${location.unitNumber} - ${location.street}`
                : `${location.street}`
            }<br>
            ${location.city}, ${location.province}, ${location.country}<br>
            ${location.postalCode}
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

            <h3 style="margin-top: 30px;">Services</h3>
            ${servicesText}

            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

            <div style="text-align: right;">
            <p style="margin-bottom: 5px;"><strong>Subtotal:</strong> $${convertPriceToDisplay(
              subtotal
            ).toFixed(2)}</p>
            <p style="margin-bottom: 5px;"><strong>Taxes:</strong> $${convertPriceToDisplay(
              taxAndFeesTotal
            ).toFixed(2)}</p>
            <p style="margin-bottom: 10px;"><strong>Total:</strong> $${convertPriceToDisplay(
              total
            ).toFixed(2)}</p>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

            <p>If you have any questions or concerns, please contact us at <strong>${orgPhone}</strong> or <strong>${orgEmail}</strong>.</p>

            <div style="margin-top: 40px; font-size: 12px; color: #888;">
            Have a great day!<br>
            ${orgName}
            </div>
        </div>
        </body>
        </html>`;
};

export const getStartJobText = (
  name,
  invoiceNumber,
  services,
  subtotal,
  taxAndFeesTotal,
  total,
  location,
  orgPhone,
  orgEmail,
  orgName,
  date
) => {
  let servicesText = ``;
  services.forEach((s) => {
    servicesText += `${s.name} ${s.description ? `- ${s.description}` : ``}\n`;
    servicesText +=
      s.rate === "flat"
        ? `${s.quantity} x $${convertPriceToDisplay(s.price).toFixed(2)}\n`
        : `${s.quantity} ${
            s.quantity > 1 ? "hours" : "hour"
          } @ ${convertPriceToDisplay(s.price).toFixed(2)}/hr\n`;
    if (s.taxesAndFees?.length > 0) {
      servicesText += `Applicable Taxes and Fees\n`;
      s.taxesAndFees.forEach((tf) => {
        servicesText +=
          tf.type === "flat"
            ? `${tf.name} - ${convertPriceToDisplay(tf.amount)}\n`
            : `${tf.name} - ${tf.amount}%\n`;
      });
      servicesText += `\n`;
    }
  });

  let dateText = ``;
  if (date.type === "single") {
    dateText += `on ${date.startDate.dateString}`;
  } else if (date.type === "multi") {
    dateText += `for ${date.startDate.dateString} to ${date.endDate.dateString}`;
  }

  return `
  Hi ${name},

  Please find your booked service(s) and details ${dateText} below. 
  You will receive an invoice and payment details once we have completed your service.

  Invoice Number: ${invoiceNumber}

  Service Location:
  ${
    location.unitNumber
      ? `${location.unitNumber} - ${location.street}`
      : `${location.street}`
  }
  ${location.city}, ${location.province}, ${location.country}
  ${location.postalCode}

  Services:
  ${servicesText}
  Subtotal: $${convertPriceToDisplay(subtotal).toFixed(2)}
  Tax & Fee Total: $${convertPriceToDisplay(taxAndFeesTotal).toFixed(2)}
  Total: $${convertPriceToDisplay(total).toFixed(2)}

  If you have any questions, please contact us at ${orgPhone} or ${orgEmail}.

  Have a great day!
  ${orgName}
  `;
};

export const getInvoiceHTML = (
  name,
  date,
  link,
  orgPhone,
  orgEmail,
  orgName
) => {
  let dateText = ``;
  if (date.type === "single") {
    dateText += `on ${date.startDate.dateString}`;
  } else if (date.type === "multi") {
    dateText += `for ${date.startDate.dateString} to ${date.endDate.dateString}`;
  }
  return `<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Post Service Report</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px; color: #333;">
  <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    
    <!-- Logo Section -->
    <div style="background-color: #f0f4f8; padding: 20px; text-align: center; border-radius: 8px;">
      <img src=${link} alt="Company Logo" style="max-width: 200px; height: auto;">
    </div>

    <!-- Main Content -->
    <h2 style="color: #4a90e2; margin-top: 30px;">Hi ${name},</h2>
    <p>
      It was a pleasure assisting you on <strong>${dateText}</strong>! We appreciate you choosing us and wanted to provide you with a post service report.
    </p>
    <p>
      Please click the link below to access your photos and payment options:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href=${link} style="background-color: #4a90e2; color: #ffffff; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-size: 16px;">
        View Photos & Pay
      </a>
    </div>

    <p>
      If you have any questions or concerns, please contact us at <strong>${orgPhone}</strong> or <strong>${orgEmail}</strong>.
    </p>

    <div style="margin-top: 40px; font-size: 12px; color: #888;">
      Have a great day!<br>
      ${orgName}
    </div>

  </div>
</body>
</html>`;
};

export const getInvoiceText = (
  name,
  date,
  link,
  orgPhone,
  orgEmail,
  orgName
) => {
  let dateText = ``;
  if (date.type === "single") {
    dateText += `on ${date.startDate.dateString}`;
  } else if (date.type === "multi") {
    dateText += `for ${date.startDate.dateString} to ${date.endDate.dateString}`;
  }
  return `
Hi ${name},

It was a pleasure assisting you on ${dateText}! We appreciate you choosing us and wanted to provide you with a post service report.

Please access your photos and payment options using the link below:
${link}

If you have any questions or concerns, please contact us at ${orgPhone} or ${orgEmail}.

Have a great day!
${orgName}`;
};

export const getReceiptHTML = (name, link, orgPhone, orgEmail, orgName) => {
  return `<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Post Service Report</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px; color: #333;">
  <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    
    <!-- Logo Section -->
    <div style="background-color: #f0f4f8; padding: 20px; text-align: center; border-radius: 8px;">
      <img src=${link} alt="Company Logo" style="max-width: 200px; height: auto;">
    </div>

    <!-- Main Content -->
    <h2 style="color: #4a90e2; margin-top: 30px;">Hi ${name},</h2>
    <p>
      Thank you for your payment! Your payment was successful.
    </p>
    <p>
      You can still access your photos at the link below.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href=${link} style="background-color: #4a90e2; color: #ffffff; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-size: 16px;">
        View Photos
      </a>
    </div>

    <p>
      If you have any questions or concerns, please contact us at <strong>${orgPhone}</strong> or <strong>${orgEmail}</strong>.
    </p>

    <div style="margin-top: 40px; font-size: 12px; color: #888;">
      Have a great day!<br>
      ${orgName}
    </div>

  </div>
</body>
</html>`;
};

export const getReceiptText = (name, link, orgPhone, orgEmail, orgName) => {
  return `
Hi ${name},

Thank you for your payment! Your payment was successful.

You can still access your photos at the link below.
${link}

If you have any questions or concerns, please contact us at ${orgPhone} or ${orgEmail}.

Have a great day!
${orgName}`;
};
