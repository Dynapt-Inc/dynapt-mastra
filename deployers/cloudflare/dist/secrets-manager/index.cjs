'use strict';

// src/secrets-manager/index.ts
var CloudflareSecretsManager = class {
  accountId;
  apiToken;
  baseUrl;
  constructor({ accountId, apiToken }) {
    this.accountId = accountId;
    this.apiToken = apiToken;
    this.baseUrl = "https://api.cloudflare.com/client/v4";
  }
  async createSecret({
    workerId,
    secretName,
    secretValue
  }) {
    const url = `${this.baseUrl}/accounts/${this.accountId}/workers/scripts/${workerId}/secrets`;
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: secretName,
          text: secretValue
        })
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.errors[0].message);
      }
      return data.result;
    } catch (error) {
      console.error("Failed to create secret:", error);
      throw error;
    }
  }
  async createProjectSecrets({
    workerId,
    customerId,
    envVars
  }) {
    const secretName = `PROJECT_${customerId.toUpperCase()}`;
    const secretValue = JSON.stringify(envVars);
    return this.createSecret({ workerId, secretName, secretValue });
  }
  async deleteSecret({ workerId, secretName }) {
    const url = `${this.baseUrl}/accounts/${this.accountId}/workers/scripts/${workerId}/secrets/${secretName}`;
    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.apiToken}`
        }
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.errors[0].message);
      }
      return data.result;
    } catch (error) {
      console.error("Failed to delete secret:", error);
      throw error;
    }
  }
  async listSecrets(workerId) {
    const url = `${this.baseUrl}/accounts/${this.accountId}/workers/scripts/${workerId}/secrets`;
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`
        }
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.errors[0].message);
      }
      return data.result;
    } catch (error) {
      console.error("Failed to list secrets:", error);
      throw error;
    }
  }
};

exports.CloudflareSecretsManager = CloudflareSecretsManager;
