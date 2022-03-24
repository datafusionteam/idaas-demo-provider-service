/*
 * (C) Copyright Data Fusion Specialists. 2022
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { FHIRServer } = require("./fhir");
const config = require("./config");
const logger = require("./logger");
const { generatePractictionerResource } = require("./fhir/resources");

// Hard code some fixed locations for provider

const location1 = {
  resourceType: "Location",
  status: "active",
  alias: ["atlanta", "atl", "dfs atl"],
  name: "DFS Chiropractic - Atlanta",
  description:
    "Welcome to DFS Chiropractic! Whether you're suffering debilitating pain from an injury, seek drug-free relief from the symptoms of a chronic condition, or just want to improve your overall state of health, you can benefit tremendously from meeting a skilled, experienced chiropractic team.",
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
  alias: ["sandy springs", "dfs sandy springs"],
  name: "DFS Chiropractic - Sandy Springs",
  description:
    "Welcome to DFS Chiropractic! Whether you're suffering debilitating pain from an injury, seek drug-free relief from the symptoms of a chronic condition, or just want to improve your overall state of health, you can benefit tremendously from meeting a skilled, experienced chiropractic team.",
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
  alias: ["fairfax", "dfs fairfax"],
  name: "DFS Chiropractic - Fairfax",
  description:
    "Welcome to DFS Chiropractic! Whether you're suffering debilitating pain from an injury, seek drug-free relief from the symptoms of a chronic condition, or just want to improve your overall state of health, you can benefit tremendously from meeting a skilled, experienced chiropractic team.",
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
  alias: ["haymarket", "dfs haymarket"],
  name: "DFS Chiropractic - Haymarket",
  description:
    "Welcome to DFS Chiropractic! Whether you're suffering debilitating pain from an injury, seek drug-free relief from the symptoms of a chronic condition, or just want to improve your overall state of health, you can benefit tremendously from meeting a skilled, experienced chiropractic team.",
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

// Hard code the patient

const patient1 = {
  resourceType: "Patient",
  identifier: [
    {
      system: "http://hl7.org/fhir/sid/us-ssn",
      value: "111223456",
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
      value: "+12223334444",
      use: "mobile",
    },
    {
      system: "email",
      value: `sarahbaker@example.com`,
      use: "home",
    },
  ],
  gender: "female",
  birthDate: "1984-04-02",
  deceasedBoolean: false,
  address: [
    {
      use: "home",
      line: ["123 Atlanta Ave SE"],
      city: "Atlanta",
      state: "GA",
      postalCode: "30315",
      country: "US",
      text: "123 Atlanta Ave SE, Atlanta, GA 30315",
    },
  ],
  maritalStatus: {
    coding: [
      {
        system: "http://snomed.info/sct",
        code: "36629006",
        display: "Legally married",
      },
      {
        system: "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus",
        code: "M",
      },
    ],
  },
  multipleBirthBoolean: false,
};

/**
 * Seeds the provider directory with data
 */
const seed = async () => {
  logger.info(
    "Seeding provider HL7 FHIR server/directory. This may take a while..."
  );

  const fhirServer = new FHIRServer(config.hapiFhirUrl);

  logger.info("Creating patient");
  const patient = await fhirServer.create("Patient", patient1);

  logger.info("Creating locations");
  const locations = [];
  for (const locationResource of locationResources) {
    const location = await fhirServer.create("Location", locationResource);
    locations.push(location);
  }

  const numPractitioners = 5;
  logger.info(`Creating ${numPractitioners} practitioners`);
  const practitioners = [];
  for (let i = 0; i < numPractitioners; i++) {
    const practitionerResource = await generatePractictionerResource(i);
    const practitioner = await fhirServer.create(
      "Practitioner",
      practitionerResource
    );
    practitioners.push(practitioner);
  }

  logger.info("Done seeding");
};

seed().catch((error) => {
  logger.error(error);
  process.exit(1);
});
