import sgMail from "@sendgrid/mail";
import {
  getInvoiceHTML,
  getInvoiceText,
  getReceiptHTML,
  getReceiptText,
  getStartJobHTML,
  getStartJobText,
} from "../utils/emailTemplates.mjs";

export const sendStartJobEmail = async (job, organization) => {
  const {
    customer,
    date,
    location,
    services,
    invoiceNumber,
    subTotal,
    totalPrice,
    taxAndFeesTotal,
  } = job;
  try {
    const orgEmail = organization.email;
    const orgPhone = organization.phoneNumber;
    const orgName = organization.name;
    const subjectText = `${organization.name} - Service booking confirmation`;
    const emailText = getStartJobText(
      customer.firstName,
      invoiceNumber,
      services,
      subTotal,
      taxAndFeesTotal,
      totalPrice,
      location,
      orgPhone,
      orgEmail,
      orgName,
      date
    );
    const emailHTML = getStartJobHTML(
      customer.firstName,
      invoiceNumber,
      services,
      subTotal,
      taxAndFeesTotal,
      totalPrice,
      location,
      orgPhone,
      orgEmail,
      orgName,
      date
    );
    const sendEmailRes = await sendEmail(
      customer.email,
      orgEmail,
      subjectText,
      emailText,
      emailHTML
    );
    if (sendEmailRes.success) {
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (err) {
    console.log("Error sending start job email: ", err);
  }
};

export const sendInvoiceEmail = async (job, organization) => {
  const { customer, date } = job;
  try {
    const encodedId = encodeURIComponent(job._id);
    const link = `http://localhost:3000/customer/${encodedId}/pay`;
    const orgEmail = organization.email;
    const orgPhone = organization.phoneNumber;
    const orgName = organization.name;
    const subjectText = `${organization.name} - Service Invoice`;
    const emailText = getInvoiceText(
      customer.firstName,
      date,
      link,
      orgPhone,
      orgEmail,
      orgName
    );
    const emailHTML = getInvoiceHTML(
      customer.firstName,
      date,
      link,
      orgPhone,
      orgEmail,
      orgName
    );
    const sendEmailRes = await sendEmail(
      customer.email,
      orgEmail,
      subjectText,
      emailText,
      emailHTML
    );
    if (sendEmailRes.success) {
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (err) {
    console.log("Error sending invoice email", err);
  }
};

export const sendReceiptEmail = async (job, organization) => {
  const { customer } = job;
  try {
    const encodedId = encodeURIComponent(job._id);
    const link = `http://localhost:3000/customer/${encodedId}/pay`;
    const orgEmail = organization.email;
    const orgPhone = organization.phoneNumber;
    const orgName = organization.name;
    const subjectText = `${organization.name} - Service Invoice`;
    const emailText = getReceiptText(
      customer.firstName,
      link,
      orgPhone,
      orgEmail,
      orgName
    );
    const emailHTML = getReceiptHTML(
      customer.firstName,
      link,
      orgPhone,
      orgEmail,
      orgName
    );
    const sendEmailRes = await sendEmail(
      customer.email,
      orgEmail,
      subjectText,
      emailText,
      emailHTML
    );
    if (sendEmailRes.success) {
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (err) {
    console.log("Error sending invoice email", err);
  }
};

export const sendEmail = async (to, from, subject, text, html) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  if (!to) {
    return;
  }
  const msg = {
    to: to,
    from: "brandon.jung@polarspark.ca",
    subject: subject,
    text: text,
    html: html,
  };
  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (err) {
    console.log("Error sending email", err);
    return { success: false };
  }
};
