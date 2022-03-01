/*
 * (C) Copyright Data Fusion Specialists. 2022
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const { v4: uuid } = require("uuid");
const DataSynthesis = require("../datasynthesis");

const generatePatientResource = async () => {
  const nameAndGender = await DataSynthesis.random.nameAndGender();
  const ssn = await DataSynthesis.random.ssn();
  const address = await DataSynthesis.random.address();
  const dob = await DataSynthesis.random.dob();
  const phoneNumber = await DataSynthesis.random.phoneNumber();

  return {
    resourceType: "Patient",
    identifier: [
      {
        system: "http://hl7.org/fhir/sid/us-ssn",
        value: ssn,
      },
    ],
    active: true,
    name: [
      {
        use: "usual",
        text: `${nameAndGender.firstName} ${nameAndGender.lastName}`,
        family: nameAndGender.lastName,
        given: [...nameAndGender.firstName.split(" ")],
      },
    ],
    telecom: [
      {
        system: "phone",
        value: phoneNumber,
        use: "mobile",
        rank: "1",
      },
      {
        system: "email",
        value: `${nameAndGender.firstName
          .toLowerCase()
          .charAt(0)}${nameAndGender.lastName.toLowerCase()}@example.com`,
        use: "home",
        rank: 2,
      },
    ],
    gender: nameAndGender.gender === "M" ? "male" : "female",
    birthDate: dob,
    address: [
      {
        use: "home",
        type: "physical",
        text: `${address.street}, ${address.city}, ${address.statecode} ${address.zipcode}`,
        city: address.city,
        state: address.statecode,
        postalCode: address.zipcode,
        country: "US",
      },
    ],
  };
};

/**
 * Generates a FHIR practitioner resource
 */
const generatePractictionerResource = async (i) => {
  const nameAndGender = await DataSynthesis.random.nameAndGender();
  const address = await DataSynthesis.random.address();
  const dob = await DataSynthesis.random.dob();
  const phoneNumber = await DataSynthesis.random.phoneNumber();

  const femaleImageUrls = [
    "https://d5t4h5a9.rocketcdn.me/wp-content/uploads/2021/01/Professional-Headshot-Examples-5-2.jpg",
    "https://d5t4h5a9.rocketcdn.me/wp-content/uploads/2021/02/Website-Photo-16-1.jpg",
    "https://d5t4h5a9.rocketcdn.me/wp-content/uploads/2021/01/Professional-Headshot-Examples-31-1.jpg",
  ];
  const maleImageUrls = [
    "https://d5t4h5a9.rocketcdn.me/wp-content/uploads/2021/02/Website-Photo-17.jpg",
    "https://d5t4h5a9.rocketcdn.me/wp-content/uploads/2021/01/Professional-Headshot-Examples-37-1.jpg",
    "https://d5t4h5a9.rocketcdn.me/wp-content/uploads/2021/01/Professional-Headshot-Examples-38.jpg",
  ];

  let imageUrl;

  if (nameAndGender.gender === "M") {
    imageUrl = maleImageUrls[i % maleImageUrls.length];
  } else {
    imageUrl = femaleImageUrls[i % femaleImageUrls.length];
  }

  return {
    resourceType: "Practitioner",
    identifier: [
      {
        value: uuid(),
      },
    ],
    active: true,
    name: [
      {
        use: "usual",
        text: `Dr. ${nameAndGender.firstName} ${nameAndGender.lastName}`,
        family: nameAndGender.lastName,
        given: [...nameAndGender.firstName.split(" ")],
      },
    ],
    telecom: [
      {
        system: "phone",
        value: phoneNumber,
        use: "mobile",
        rank: "1",
      },
    ],
    gender: nameAndGender.gender === "M" ? "male" : "female",
    birthDate: dob,
    photo: imageUrl
      ? [
          {
            url: imageUrl,
            title: `Headshot of Dr. ${nameAndGender.firstName} ${nameAndGender.lastName}`,
          },
        ]
      : [],
    address: [
      {
        use: "home",
        type: "physical",
        text: `${address.street}, ${address.city}, ${address.statecode} ${address.zipcode}`,
        city: address.city,
        state: address.statecode,
        postalCode: address.zipcode,
        country: "US",
      },
    ],
    qualifications: [
      {
        identifier: [
          {
            value: uuid(),
          },
        ],
        code: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v2-0360/2.7",
              code: "DC",
              display: "Doctor of Chiropractic",
            },
          ],
          text: "Doctor of Chiropractic",
        },
        period: {
          start: "1995",
          end: "1999",
        },
        issuer: {
          display: "Palmer College",
        },
      },
    ],
  };
};

module.exports = {
  generatePatientResource,
  generatePractictionerResource,
};
