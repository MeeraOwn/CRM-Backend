import crmCustomer from "../models/crmCustomer.js";
import historyModel from "../models/history.js";

import logger from "../utilities/logger.js";
import { error, success } from "../utilities/response.js";

const getAppointments = async (req, res) => {
  try {
    const rows = await historyModel.listAppointments();
    res.status(200).json(success("OK", rows));
  } catch (e) {
    logger.error(e.message);
    res.status(500).json(error(e.message));
  }
};

const completeAppointment = async (req, res) => {
  try {
    const { historyId } = req.params;
    const completed = await historyModel.completeAppointment(historyId);
    if (!completed) return res.status(404).json(error("Appointment not found"));
    // Return success only; frontend will re-fetch Appointment List.
    res.status(200).json(success("OK", { completed: true }));
  } catch (e) {
    logger.error(e.message);
    res.status(500).json(error(e.message));
  }
};

const getCustomerById = async (req, res) => {
  try {
    const { customerId } = req.params;
    const customer = await crmCustomer.findById(customerId);
    if (!customer) return res.status(404).json(error("Customer not found"));
    res.status(200).json(success("OK", customer));
  } catch (e) {
    logger.error(e.message);
    res.status(500).json(error(e.message));
  }
};

const getCustomerHistory = async (req, res) => {
  try {
    const { customerId } = req.params;
    const history = await historyModel.listByCustomerId(customerId);
    res.status(200).json(success("OK", history));
  } catch (e) {
    logger.error(e.message);
    res.status(500).json(error(e.message));
  }
};

const createHistoryForCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { subject, art, description, date, time } = req.body;

    const created_by = req.user?.sub;
    if (!created_by) return res.status(401).json(error("Unauthorized"));

    const created = await historyModel.createForCustomer({
      customer_id: customerId,
      subject,
      art,
      description,
      date,
      time,
      created_by,
    });

    res.status(201).json(success("CREATED", created));
  } catch (e) {
    logger.error(e.message);
    res.status(500).json(error(e.message));
  }
};

const canStaffModifyHistory = (reqUser, historyRow) => {
  if (!reqUser) return false;
  if (reqUser.role === "Admin") return true;
  // Staff can only edit/delete what they created.
  return String(historyRow?.created_by) === String(reqUser?.sub);
};

const updateHistoryById = async (req, res) => {
  try {
    const { historyId } = req.params;
    const { subject, art, description, date, time } = req.body;

    const existing = await historyModel.findById(historyId);
    if (!existing) return res.status(404).json(error("History not found"));

    if (!canStaffModifyHistory(req.user, existing)) {
      return res.status(403).json(error("Forbidden"));
    }

    const updated = await historyModel.updateById(historyId, {
      subject,
      art,
      description,
      date,
      time,
    });

    res.status(200).json(success("UPDATED", updated));
  } catch (e) {
    logger.error(e.message);
    res.status(500).json(error(e.message));
  }
};

const deleteHistoryById = async (req, res) => {
  try {
    const { historyId } = req.params;

    const existing = await historyModel.findById(historyId);
    if (!existing) return res.status(404).json(error("History not found"));

    if (!canStaffModifyHistory(req.user, existing)) {
      return res.status(403).json(error("Forbidden"));
    }

    await historyModel.deleteById(historyId);
    res.status(200).json(success("DELETED", true));
  } catch (e) {
    logger.error(e.message);
    res.status(500).json(error(e.message));
  }
};

const createCustomer = async (req, res) => {
  try {
    const { role } = req.user || {};
    if (role !== "Admin") {
      return res.status(403).json(error("Forbidden"));
    }

    const {
      first_name,
      last_name,
      customerId,
      email,
      phone,
      brokerNumber,
      customerTitle,
      customerDisplayName,
      customerDOB,
      customerStreet,
      customerHouseNumber,
      customerPostalCode,
      customerCity,
      customerStatus,
      description,
    } = req.body;
    if (!first_name || !last_name || !email || !phone || !customerId) {
      return res.status(400).json(error("Missing required fields"));
    }

    const created = await crmCustomer.create({
      first_name,
      last_name,
      customerId,
      email,
      phone,
      brokerNumber,
      customerTitle,
      customerDisplayName,
      customerDOB,
      customerStreet,
      customerHouseNumber,
      customerPostalCode,
      customerCity,
      customerStatus,
      description,
    });

    res.status(201).json(success("CREATED", created));
  } catch (e) {
    logger.error(e.message);
    res.status(500).json(error(e.message));
  }
};

export default {
  getAppointments,
  completeAppointment,
  getCustomerById,
  getCustomerHistory,
  createHistoryForCustomer,
  updateHistoryById,
  deleteHistoryById,
  createCustomer,
};
