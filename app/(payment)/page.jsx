"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function PaymentPage() {
  const [form, setForm] = useState({ name: "", phone: "", method: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [dialogData, setDialogData] = useState({
    success: false,
    message: "",
    ticketUrl: "",
  });

  const validateFormStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!form.name.trim()) newErrors.name = "Name is required";
      if (!form.phone.trim()) newErrors.phone = "Phone number is required";
      if (!/^\d{9}$/.test(form.phone.trim()))
        newErrors.phone = "Invalid phone number format";
    }

    if (currentStep === 2) {
      if (!form.method) newErrors.method = "Please select a payment method";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateFormStep(step)) {
      setStep(2);
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handlePayment = async () => {
    if (!validateFormStep(2)) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5002/api/register-and-pay",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            tel: form.phone,
            type: form.method,
            amount: 10000,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setDialogData({
          success: true,
          message: "Payment successful! Download your ticket.",
          ticketUrl: data.ticketPath,
        });
      } else {
        setDialogData({
          success: false,
          message: `Payment failed: ${data.message}`,
        });
      }

      setIsDialogOpen(true);
    } catch (error) {
      setDialogData({
        success: false,
        message: "An unexpected error occurred.",
      });
      setIsDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTicket = () => {
    if (dialogData.ticketUrl) {
      window.open(
        `http://localhost:5002/api/download-ticket/${dialogData.ticketUrl}`,
        "_blank"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center p-4 md:p-8">
      {/* Progress Steps */}
      <div className="w-full max-w-md mb-8">
        <div className="flex justify-between items-center">
          {[1, 2].map((stepNumber) => (
            <div key={stepNumber} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= stepNumber
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {stepNumber}
              </div>
              <span className="text-sm mt-2">
                {stepNumber === 1 ? "Details" : "Payment"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Image
          src="/logo.png"
          alt="Company Logo"
          width={120}
          height={120}
          className="mx-auto drop-shadow-md"
        />
        <h1 className="text-3xl font-bold mt-4 text-gray-800">
          GoMAD Event Payment
        </h1>
        <div className="mt-2 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full inline-block">
          Amount: 10,000 FCFA
        </div>
      </motion.header>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 bg-white shadow-lg rounded-xl p-8 w-full max-w-md border border-gray-100"
      >
        {step === 1 ? (
          <>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              <button
                onClick={handleNextStep}
                className="w-full bg-indigo-600 text-white font-semibold rounded-lg py-3 px-4 hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center"
              >
                Continue to Payment
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-6">
              <fieldset>
                <legend className="text-lg font-medium text-gray-900 mb-4">
                  Select Payment Method
                </legend>
                <div className="grid grid-cols-2 gap-4">
                  {["momo", "om"].map((method) => (
                    <label
                      key={method}
                      className={`relative flex flex-col items-center p-4 border rounded-lg cursor-pointer hover:border-indigo-500 transition-all ${
                        form.method === method
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200"
                      }`}
                    >
                      <Image
                        src={`/${method === "momo" ? "mtn" : "om"}.png`}
                        alt={
                          method === "momo" ? "Mobile Money" : "Orange Money"
                        }
                        width={48}
                        height={48}
                        className="mb-2"
                      />
                      <input
                        type="radio"
                        name="method"
                        value={method}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">
                        {method === "momo" ? "Mobile Money" : "Orange Money"}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.method && (
                  <p className="mt-2 text-sm text-red-500">{errors.method}</p>
                )}
              </fieldset>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 text-gray-700 font-medium rounded-lg py-3 px-4 hover:bg-gray-200 transition-colors duration-200"
                >
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isLoading}
                  className="flex-1 bg-indigo-600 text-white font-semibold rounded-lg py-3 px-4 hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center disabled:bg-indigo-400"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  {isLoading ? "Processing..." : "Pay Now"}
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Enhanced Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        className="relative z-50"
      >
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <div className="flex items-center justify-center mb-4">
              {dialogData.success ? (
                <CheckCircle className="w-12 h-12 text-green-500" />
              ) : (
                <AlertCircle className="w-12 h-12 text-red-500" />
              )}
            </div>
            <Dialog.Title
              className={`text-lg font-semibold text-center ${
                dialogData.success ? "text-green-600" : "text-red-600"
              }`}
            >
              {dialogData.success ? "Payment Successful!" : "Payment Failed"}
            </Dialog.Title>
            <Dialog.Description className="mt-4 text-gray-700 text-center">
              {dialogData.message}
            </Dialog.Description>
            <div className="mt-6 flex flex-col gap-3">
              {dialogData.success && (
                <button
                  onClick={downloadTicket}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
                >
                  Download Ticket
                </button>
              )}
              <button
                onClick={() => setIsDialogOpen(false)}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
