/*
 * (C) Copyright Data Fusion Specialists. 2022
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const { FHIRServer } = require("./fhir");
const config = require("./config");
const { generatePractictionerResource } = require("./fhir/resources");

// Hard code some fixed locations for provider

const location1 = {
  resourceType: "Location",
  status: "active",
  alias: ["atlanta", "atl", "pinnacle atl"],
  name: "Pinnacle Chiropractic - Atlanta",
  description:
    "Welcome to Pinnacle Chiropractic! Whether you're suffering debilitating pain from an injury, seek drug-free relief from the symptoms of a chronic condition, or just want to improve your overall state of health, you can benefit tremendously from meeting a skilled, experienced chiropractic team.",
  telecom: [
    {
      system: "phone",
      value: "+11234567890",
      use: "mobile",
      rank: "1",
    },
  ],
  address: {
    use: "home",
    type: "physical",
    text: "1526 Howell Mill Rd NW, Atlanta, GA 30318",
    city: "Atlanta",
    state: "GA",
    postalCode: "30318",
    country: "US",
  },
  position: {
    longitude: -84.41641,
    latitude: 33.79696,
  },
  hoursOfOperation: [
    {
      daysOfWeek: ["mon", "tue", "wed", "thu", "fri", "sat"],
      openingTime: "09:00:00",
      closingTime: "17:00:00",
    },
  ],
};

const location2 = {
  resourceType: "Location",
  status: "active",
  alias: ["sandy springs", "pinnacle sandy springs"],
  name: "Pinnacle Chiropractic - Sandy Springs",
  description:
    "Welcome to Pinnacle Chiropractic! Whether you're suffering debilitating pain from an injury, seek drug-free relief from the symptoms of a chronic condition, or just want to improve your overall state of health, you can benefit tremendously from meeting a skilled, experienced chiropractic team.",
  telecom: [
    {
      system: "phone",
      value: "+11234567890",
      use: "mobile",
      rank: "1",
    },
  ],
  address: {
    use: "home",
    type: "physical",
    text: "6111 Peachtree Dunwoody Road, Sandy Springs, GA 30328",
    city: "Sandy Springs",
    state: "GA",
    postalCode: "30328",
    country: "US",
  },
  position: {
    longitude: -84.34953,
    latitude: 33.9217,
  },
  hoursOfOperation: [
    {
      daysOfWeek: ["mon", "tue", "wed", "thu", "fri", "sat"],
      openingTime: "09:00:00",
      closingTime: "17:00:00",
    },
  ],
};

const location3 = {
  resourceType: "Location",
  status: "active",
  alias: ["fairfax", "pinnacle fairfax"],
  name: "Pinnacle Chiropractic - Fairfax",
  description:
    "Welcome to Pinnacle Chiropractic! Whether you're suffering debilitating pain from an injury, seek drug-free relief from the symptoms of a chronic condition, or just want to improve your overall state of health, you can benefit tremendously from meeting a skilled, experienced chiropractic team.",
  telecom: [
    {
      system: "phone",
      value: "+11234567890",
      use: "mobile",
      rank: "1",
    },
  ],
  address: {
    use: "home",
    type: "physical",
    text: "10640 Main St STE 103, Fairfax, VA 22030",
    city: "Fairfax",
    state: "VA",
    postalCode: "22030",
    country: "US",
  },
  position: {
    longitude: -77.31305,
    latitude: 38.84863,
  },
  hoursOfOperation: [
    {
      daysOfWeek: ["mon", "tue", "wed", "thu", "fri", "sat"],
      openingTime: "09:00:00",
      closingTime: "17:00:00",
    },
  ],
};

const location4 = {
  resourceType: "Location",
  status: "active",
  alias: ["haymarket", "pinnacle haymarket"],
  name: "Pinnacle Chiropractic - Haymarket",
  description:
    "Welcome to Pinnacle Chiropractic! Whether you're suffering debilitating pain from an injury, seek drug-free relief from the symptoms of a chronic condition, or just want to improve your overall state of health, you can benefit tremendously from meeting a skilled, experienced chiropractic team.",
  telecom: [
    {
      system: "phone",
      value: "+11234567890",
      use: "mobile",
      rank: "1",
    },
  ],
  address: {
    use: "home",
    type: "physical",
    text: "15100 Washington St, Haymarket, VA 20169",
    city: "Haymarket",
    state: "VA",
    postalCode: "20169",
    country: "US",
  },
  position: {
    longitude: -77.63759,
    latitude: 38.81316,
  },
  hoursOfOperation: [
    {
      daysOfWeek: ["mon", "tue", "wed", "thu", "fri", "sat"],
      openingTime: "09:00:00",
      closingTime: "17:00:00",
    },
  ],
};

const locationResources = [location1, location2, location3, location4];

const patient1 = {
  resourceType: "Patient",
  identifier: [
    {
      system: "http://hl7.org/fhir/sid/us-ssn",
      value: "721094426",
    },
  ],
  active: true,
  name: [
    {
      use: "usual",
      text: "Sarah Lee Baker",
      family: "Baker",
      given: ["Sarah"],
    },
  ],
  telecom: [
    {
      system: "phone",
      value: "1112223333",
      use: "mobile",
      rank: "1",
    },
    {
      system: "email",
      value: `sarahbaker@example.com`,
      use: "home",
      rank: 2,
    },
  ],
  gender: "female",
  birthDate: "12-01-98",
  address: [
    {
      use: "home",
      type: "physical",
      text: "123 Atlanta Rd",
      city: "Atlanta",
      state: "GA",
      postalCode: "30332",
      country: "US",
    },
  ],
};

const patientResources = [patient1];

/**
 * Seeds the provider directory with data
 */
const seed = async () => {
  console.log(
    "Seeding provider HL7 FHIR server/directory. This may take a while..."
  );

  const fhirServer = new FHIRServer(config.hapiFhir.host);

  console.log(`Creating patient records`);
  const patients = [];
  for (const patientResource of patientResources) {
    const patient = await fhirServer.create("Patient", patientResource);
    patients.push(patient);
  }

  console.log("Creating locations");
  const locations = [];
  for (const locationResource of locationResources) {
    const location = await fhirServer.create("Location", locationResource);
    locations.push(location);
  }

  const numPractitioners = 6;
  console.log(`Creating ${numPractitioners} practitioners`);
  const practitioners = [];
  for (let i = 0; i < numPractitioners; i++) {
    const practitionerResource = await generatePractictionerResource(i);
    const practitioner = await fhirServer.create(
      "Practitioner",
      practitionerResource
    );
    practitioners.push(practitioner);
  }

  console.log("Done seeding");
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
