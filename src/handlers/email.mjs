import sgMail from "@sendgrid/mail";
import { findOrganizationById } from "./organizations.mjs";
import { getStartJobHTML, getStartJobText } from "../utils/emailTemplates.mjs";

export const sendStartJobEmail = async (req, res, next) => {
  const { job } = req.body;

  const {
    customer,
    date,
    location,
    services,
    organizationId,
    invoiceNumber,
    subTotal,
    totalPrice,
    taxAndFeesTotal,
  } = job;
  try {
    const organization = await findOrganizationById(organizationId);
    const orgEmail = organization.email;
    const subjectText = `${organization.name} - Service booking confirmation`;
    const emailText = getStartJobText(
      customer.firstName,
      invoiceNumber,
      services,
      subTotal,
      taxAndFeesTotal,
      totalPrice,
      location,
      organization.phoneNumber,
      organization.email,
      organization.name,
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
      organization.phoneNumber,
      organization.email,
      organization.name,
      date
    );
    const sendEmailRes = await sendEmail(
      customer.email,
      orgEmail,
      subjectText,
      emailText,
      emailHTML
    );
    return res.status(200).send(sendEmailRes);
  } catch (err) {
    console.log("Error sending start job email: ", err);
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
