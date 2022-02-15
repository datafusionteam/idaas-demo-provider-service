const { FHIRServer } = require("./fhir");
const config = require("./config");
const { client, pool } = require("./db");
const {
  generatePatientResource,
  generatePractictionerResource,
} = require("./fhir/resources");

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

/**
 * Create relation tale for practitioners and locations
 */
const createPractitionerLocationTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS practitioner_location (
      practitioner_id INT NOT NULL,
      location_id INT NOT NULL,
      PRIMARY KEY (practitioner_id, location_id)
    )
  `;
  await client.query(query);
};

/**
 * Insert into practitioner location table the relationship between practitioners and locations
 * @param {*} poolClient
 * @param {*} locationId
 * @param {*} practitionerId
 */
const createPractitionerLocationRelation = async (
  poolClient,
  locationId,
  practitionerId
) => {
  try {
    await poolClient.query(
      "INSERT INTO practitioner_location (location_id, practitioner_id) VALUES ($1, $2)",
      [locationId, practitionerId]
    );
    console.log(
      `Added practitioner ${practitionerId} to location ${locationId}`
    );
  } catch (error) {
    console.error(error);
  }
};

/**
 * Seeds the provider directory with data
 */
const seed = async () => {
  console.log(
    "Seeding provider HL7 FHIR server/directory. This may take a while..."
  );

  await client.connect();
  console.log("Dropping db...");
  const query = `
    DROP DATABASE IF EXISTS fhir
  `;
  await client.query(query);

  const fhirServer = new FHIRServer(config.hapiFhir.host);

  const numPatientRecords = 50;
  console.log(`Creating ${numPatientRecords} patient records`);
  const patients = [];
  for (let i = 0; i < numPatientRecords; i++) {
    const patientResource = await generatePatientResource();
    const patient = await fhirServer.create("Patient", patientResource);
    patients.push(patient);
  }

  console.log("Creating locations");
  const locations = [];
  for (const locationResource of locationResources) {
    const location = await fhirServer.create("Location", locationResource);
    locations.push(location);
  }

  const numPractitioners = 8;
  console.log(`Creating ${numPractitioners} practitioners`);
  const practitioners = [];
  for (let i = 0; i < numPractitioners; i++) {
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

    const practitionerResource = await generatePractictionerResource(imageUrl);
    const practitioner = await fhirServer.create(
      "Practitioner",
      practitionerResource
    );
    practitioners.push(practitioner);
  }

  await createPractitionerLocationTable();

  const poolClient = await pool.connect();

  for (let i = 0; i < numPractitioners; i++) {
    const practitioner = practitioners[i];
    const location =
      locationResources[Math.floor(Math.random() * locationResources.length)];
    await createPractitionerLocationRelation(
      poolClient,
      location.id,
      practitioner.id
    );
  }

  console.log("Done seeding");
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
