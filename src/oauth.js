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

const axios = require("axios");
const logger = require("./logger");

/**
 * Refresh the microsoft provider tokens
 */
const refreshTokens = async (
  tenantId,
  clientId,
  clientSecret,
  refreshToken
) => {
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const tokenParams = new URLSearchParams();
  tokenParams.append("grant_type", "refresh_token");
  tokenParams.append("client_id", clientId);
  tokenParams.append("client_secret", clientSecret);
  tokenParams.append("refresh_token", refreshToken);

  return axios
    .post(tokenUrl, tokenParams)
    .then((response) => response.data)
    .then((response) => {
      // Extract the tokens from the oauth2 response
      const accessToken = response["access_token"];
      const refreshToken = response["refresh_token"];

      process.env.PROVIDER_ACCESS_TOKEN = accessToken;
      process.env.PROVIDER_REFRESH_TOKEN = refreshToken;
    })
    .catch((err) => {
      logger.error("There was a problem refreshing tokens");
      logger.error(err);
    });
};

module.exports = {
  refreshTokens,
};
