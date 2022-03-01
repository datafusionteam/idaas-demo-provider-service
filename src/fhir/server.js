/*
 * (C) Copyright Data Fusion Specialists. 2022
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const { Axios } = require("axios");

class FHIRServer {
  constructor(
    host,
    port = 8080,
    protocol = "http",
    basePath = "/hapi-fhir-jpaserver/fhir",
    version = "R4"
  ) {
    this.config = {
      host,
      port,
      protocol,
      basePath,
      version,
    };
    this.client = new Axios({
      baseURL: `${this.config.protocol}://${this.config.host}:${this.config.port}${this.config.basePath}`,
    });
  }

  get = (resourceType, id) => {
    return this.client.get(`/${resourceType}/${id}`).then((result) => {
      if (typeof result.data === "string") {
        return JSON.parse(result.data);
      }
      return result.data;
    });
  };

  create = (resourceType, resource) => {
    return this.client
      .post(`/${resourceType}`, JSON.stringify(resource), {
        headers: { "Content-Type": "application/json" },
      })
      .then((result) => result.data);
  };

  search = (resourceType, params) => {
    return this.client
      .get(`/${resourceType}`, { params })
      .then((result) => {
        if (typeof result.data === "string") {
          return JSON.parse(result.data);
        }
        return result.data;
      })
      .then((bundle) => bundle.entry);
  };
}

module.exports = FHIRServer;