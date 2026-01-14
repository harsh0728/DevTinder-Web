import React, { useEffect, useState } from 'react'
import { apiFetch } from '../api/apiFetch';

const Premium = () => {
  const [IsUserPremium,setIsUserPremium]=useState(false);

  useEffect(()=>{
  verifyPremiumUser();
  },[])

  const verifyPremiumUser=async()=>{
    const res=await apiFetch("/payment/premium/verify");

    if (res.data?.isPremium) {
      setIsUserPremium(true);
    }
  }

  const handleBuyClick=async(type)=>{
    try {
      const order = await apiFetch("/payment/create-order", {
        method: "POST",
        body: JSON.stringify({ membershipType: type }),
      });

      // It should open the razorpay dialogue box

      const {amount,keyId,currency,notes,orderId,}=order?.data || "";

      const options = {
        key: keyId, // Replace with your Razorpay key_id
        amount: amount, // Amount is in currency subunits.
        currency: currency,
        name: 'Dev Tinder',
        description: 'Connect to other developers',
        order_id: orderId, // This is the order_id created in the backend
        prefill: {
          name: notes?.firstName + ' ' + notes?.lastName,
          email: notes?.email,
          contact: '9999999999'
        },
        theme: {
          color: '#F37254'
        },
        handler: verifyPremiumUser,
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Error purchasing membership:", error);
    }
  }

  return IsUserPremium ? "You are already a Premium User" : (
    <>
    <div className="text-white bg-[#131633] m-10">
      <div className="flex w-full">
        <div className="card bg-base-300 rounded-box grid h-80 flex-grow place-items-center">
          <h1 className="font-bold text-3xl">Silver Membership</h1>
          <ul>
            <li> - Chat with other people</li>
            <li> - 100 connection Requests per day</li>
            <li> - Blue Tick</li>
            <li> - 3 months</li>
          </ul>
          <button
            onClick={() => handleBuyClick("silver")}
            className="btn btn-secondary"
          >
            Buy Silver
          </button>
        </div>
        <div className="divider divider-horizontal">OR</div>
        <div className="card bg-base-300 rounded-box grid h-80 flex-grow place-items-center">
          <h1 className="font-bold text-3xl">Gold Membership</h1>
          <ul>
            <li> - Chat with other people</li>
            <li> - Inifinite connection Requests per day</li>
            <li> - Blue Tick</li>
            <li> - 6 months</li>
          </ul>
          <button
            onClick={() => handleBuyClick("gold")}
            className="btn btn-primary"
          >
            Buy Gold
          </button>
        </div>
      </div>
    </div>
    </>
  )
}

export default Premium