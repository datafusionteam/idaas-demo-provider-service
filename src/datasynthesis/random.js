/*
 * (C) Copyright Data Fusion Specialists. 2022
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require("fs/promises");
const path = require("path");
const pool = require("./db");

const getQuery = async (name) => {
  const file = path.resolve(__dirname, `./sql/${name}.sql`);
  const query = await fs.readFile(file);
  return query.toString();
};

module.exports = {
  /**
   * Get a random phone number
   * @returns {String} Phone number
   */
  phoneNumber: async () => {
    const client = await pool.connect();
    const query = await getQuery("phonenumber");

    try {
      const result = await client.query(query, []);
      const row = result.rows[0];
      return `+1${row.areacode}${row.phonenumber.replace("-", "")}`;
    } finally {
      client.release();
    }
  },

  /**
   * Gets a random address from db
   */
  address: async () => {
    const client = await pool.connect();

    const addressQuery = await getQuery("address");
    const zipcodeQuery = await getQuery("zipcode");

    try {
      const addressResult = await client.query(addressQuery, []);
      const zipcodeResult = await client.query(zipcodeQuery, []);

      const address = addressResult.rows[0];
      const zipcode = zipcodeResult.rows[0];
      return {
        street: address.street,
        street2: address.street2,
        zipcode: zipcode.zipcode,
        city: zipcode.city,
        statecode: zipcode.statecode,
      };
    } finally {
      client.release();
    }
  },

  /**
   * Gets a random date of birth
   * @returns {String} Date of birth
   */
  dob: async () => {
    const client = await pool.connect();
    const query = await getQuery("dateofbirth");
    try {
      const result = await client.query(query, []);
      const row = result.rows[0];
      return row.dob;
    } finally {
      client.release();
    }
  },

  /**
   * Get a random name and gender
   */
  nameAndGender: async () => {
    const client = await pool.connect();

    const firstNameQuery = await getQuery("firstname");
    const lastNameQuery = await getQuery("lastname");

    try {
      const firstNameResult = await client.query(firstNameQuery, []);
      const lastNameResult = await client.query(lastNameQuery, []);

      const firstNameRow = firstNameResult.rows[0];
      const lastNameRow = lastNameResult.rows[0];

      return {
        gender: firstNameRow.gender,
        firstName: firstNameRow.firstname,
        lastName: lastNameRow.lastname,
      };
    } finally {
      client.release();
    }
  },

  /**
   * Get a random SSN
   * @returns {String} SSN
   */
  ssn: async () => {
    const client = await pool.connect();
    const query = await getQuery("ssn");

    try {
      const result = await client.query(query, []);
      const row = result.rows[0];
      return row.ssn;
    } finally {
      client.release();
    }
  },
};
