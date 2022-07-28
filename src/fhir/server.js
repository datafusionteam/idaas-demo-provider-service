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

const { Axios } = require("axios");

class FHIRServer {
  constructor(
    url,
    basePath = "/hapi-fhir-jpaserver/fhir",
    version = "R4",
    debug = false
  ) {
    this.config = {
      url,
      basePath,
      version,
    };
    this.client = new Axios({
      baseURL: `${url}${this.config.basePath}`,
      validateStatus: (status) => status < 500,
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
      .then((result) => {
        if (typeof result.data === "string") {
          return JSON.parse(result.data);
        }
        return result.data;
      });
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
