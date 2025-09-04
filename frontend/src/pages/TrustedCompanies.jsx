import React from "react";
import "./css/TrustedCompanies.css";

const companies = [
  {
    name: "TechWorld Solutions",
    address: "Nairobi CBD, Kenyatta Avenue, Nairobi, Kenya",
    phone: "+254 711 234 567",
    email: "info@techworld.co.ke",
    website: "https://techworld.co.ke",
    description:
      "Leading provider of electronics and IT solutions with reliable after-sales service.",
  },
  {
    name: "GreenMart Organics",
    address: "Westlands, Nairobi, Kenya",
    phone: "+254 722 345 678",
    email: "support@greenmart.co.ke",
    website: "https://greenmart.co.ke",
    description:
      "Trusted supplier of organic groceries and farm-fresh produce across Kenya.",
  },
  {
    name: "Skyline Electronics",
    address: "Moi Avenue, Mombasa, Kenya",
    phone: "+254 733 456 789",
    email: "contact@skylineelectronics.co.ke",
    website: "https://skylineelectronics.co.ke",
    description:
      "Authorized reseller of smartphones, laptops, and home appliances at fair prices.",
  },
  {
    name: "Safari Furniture",
    address: "Industrial Area, Nairobi, Kenya",
    phone: "+254 700 987 654",
    email: "sales@safarifurniture.co.ke",
    website: "https://safarifurniture.co.ke",
    description:
      "Quality furniture manufacturer offering modern and affordable home solutions.",
  },
  {
    name: "HealthFirst Pharmacy",
    address: "Kisumu Central, Oginga Odinga Street, Kisumu, Kenya",
    phone: "+254 712 876 543",
    email: "care@healthfirst.co.ke",
    website: "https://healthfirst.co.ke",
    description:
      "Registered pharmacy chain ensuring safe and affordable healthcare products.",
  },
];

const TrustedCompanies = () => {
  return (
    <div className="trusted-container">
      {/* Hero Section */}
      <div className="trusted-hero">
        <h1>Trusted Companies</h1>
        <p>
          At Peakers Hub, we recommend businesses that deliver reliable products
          and services in Kenya.
        </p>
      </div>

      {/* Companies List */}
      <div className="trusted-list">
        {companies.map((company, index) => (
          <div key={index} className="trusted-card">
            <h2>{company.name}</h2>
            <p>
              <strong>Address:</strong> {company.address}
            </p>
            <p>
              <strong>Phone:</strong> {company.phone}
            </p>
            <p>
              <strong>Email:</strong> {company.email}
            </p>
            <p>
              <strong>Website:</strong>{" "}
              <a href={company.website} target="_blank" rel="noreferrer">
                {company.website}
              </a>
            </p>
            <p>{company.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustedCompanies;
