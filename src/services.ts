import { AuthApi } from "./api/auth";
import { Scx } from "./scx";
import { AclUser, DecryptionKey, EncryptionKey, UserInfo } from "./types";
import fetch from "cross-fetch";
import { KeyRequest, KeyResponse, ReadersListing } from "./types/key";
import { fetchApi } from "./utils/fetchApi";

export class Services {
  private auth: AuthApi;

  constructor(auth: AuthApi) {
    this.auth = auth;
  }

  async getUserInfo(): Promise<UserInfo> {
    if (!(await this.auth.isLoggedIn())) throw new Error("Token expired!");
    try {
      const response = await fetch(
        `${Scx.API_BASE}/auth/user-account-management/users/me`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.auth.getToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user information`);
      }

      return await response.json();
    } catch (err) {
      throw new Error("Failed to fetch user information");
    }
  }

  async getKeyInfo(keyId: string): Promise<EncryptionKey> {
    if (!(await this.auth.isLoggedIn())) throw new Error("Token expired!");
    try {
      const response = await fetch(`${Scx.API_BASE}/keys/read/${keyId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.auth.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to read encryption key ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error reading encryption key:", error);
      throw new Error("Failed to read encryption key");
    }
  }

  async getReaders(keyId: string) {
    if (!(await this.auth.isLoggedIn())) throw new Error("Token expired!");
    try {
      const response = await fetch(
        `${Scx.API_BASE}/keys/read/readers/${keyId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.auth.getToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch assigned access list ${response.status}`
        );
      }

      return await response.json();
    } catch (err) {
      throw new Error("Failed to fetch assigned access list");
    }
  }

  async addReaders(
    userId: string,
    receivers: string[]
  ): Promise<DecryptionKey> {
    if (!(await this.auth.isLoggedIn())) throw new Error("Token expired!");
    try {
      if (!userId || !Array.isArray(receivers))
        throw Error("Invalid parameters");

      const response = await fetch(`${Scx.API_BASE}/keys/manage/add`, {
        method: "POST",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${this.auth.getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ownerUserId: userId,
          identities: receivers.map((email) => ({
            value: email,
            type: "EMAIL",
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch encryption key ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      throw new Error("Failed to fetch encryption key");
    }
  }

  async updateReaders(keyId: string, receiver: string): Promise<DecryptionKey> {
    if (!(await this.auth.isLoggedIn())) throw new Error("Token expired!");
    try {
      if (!keyId || !receiver) throw Error("Invalid parameters");

      const response = await fetch(
        `${Scx.API_BASE}/keys/manage/readers/add/${keyId}`,
        {
          method: "PUT",
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${this.auth.getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify([{ value: receiver, type: "EMAIL" }]),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to assign access to ${receiver} ${response.status}`
        );
      }

      return await response.json();
    } catch (err) {
      throw new Error("Failed to assign access to " + receiver);
    }
  }

  async deleteReader(keyId: string, receivers: string[]): Promise<boolean> {
    if (!(await this.auth.isLoggedIn())) throw new Error("Token expired!");
    try {
      const response = await fetch(
        `${Scx.API_BASE}/keys/manage/readers/delete/${keyId}`,
        {
          method: "PUT",
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${this.auth.getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            receivers.map((email) => ({ value: email, type: "EMAIL" }))
          ),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to remove access ${response.status}`);
      }

      return response.status === 200;
    } catch (err) {
      console.error("Error parsing JSON:", err);
      throw new Error("Failed to remove access");
    }
  }

  async deleteReaders(keyId: string) {
    if (!(await this.auth.isLoggedIn())) throw new Error("Token expired!");
    try {
      const response = await fetch(
        `${Scx.API_BASE}/keys/readers/delete/${keyId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${this.auth.getToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to remove assigned access list ${response.status}`
        );
      }

      return await response.json();
    } catch (err) {
      throw new Error("Failed to remove assigned access list");
    }
  }

  // Creates key and adds readers by emails and entityIds
  async generateEncryptionKey(reqData: KeyRequest): Promise<KeyResponse> {
    try {
      const response = await fetchApi(
        `${Scx.API_BASE}/keys`,
        {
          method: "POST",
          body: JSON.stringify(reqData),
          authRequired: true,
        },
        this.auth
      );
      return await response.json();
    } catch (err) {
      throw new Error("Failed to fetch encryption key");
    }
  }

  // Update key readers
  async updateKeyReaders(
    id: string,
    reqData: KeyRequest
  ): Promise<KeyResponse> {
    try {
      const response = await fetchApi(
        `${Scx.API_BASE}/keys/${id}/acl`,
        {
          method: "PUT",
          body: JSON.stringify(reqData),
          authRequired: true,
        },
        this.auth
      );
      return await response.json();
    } catch (err) {
      throw new Error("Failed to update readers");
    }
  }

  async getKeyById(id: string): Promise<EncryptionKey> {
    try {
      const response = await fetchApi(
        `${Scx.API_BASE}/keys/${id}`,
        {
          authRequired: true,
        },
        this.auth
      );
      return await response.json();
    } catch (error) {
      console.error("Error reading encryption key:", error);
      throw new Error("Failed to read encryption key");
    }
  }

  // get ACL users details
  async getAclUsersDetails(ids: string[]): Promise<AclUser[]> {
    try {
      const queryParams = new URLSearchParams();
      ids.forEach((entity) => queryParams.append("entities", entity));
      const response = await fetchApi(
        `${
          Scx.API_BASE
        }/scipherx/entity-management/entities/details?${queryParams.toString()}`,
        {
          authRequired: true,
        },
        this.auth
      );
      return await response.json();
    } catch (error) {
      console.error("Error reading encryption key:", error);
      throw new Error("Failed to read encryption key");
    }
  }

  async getAclReadersByKey(id: string): Promise<ReadersListing> {
    try {
      const response = await fetchApi(
        `${Scx.API_BASE}/keys/${id}/acl`,
        {
          authRequired: true,
        },
        this.auth
      );
      return await response.json();
    } catch (error) {
      console.error("Error reading acl readers", error);
      throw new Error("Failed to read acl readers");
    }
  }

  async searchEntitiesByKeywords(keyword: string): Promise<AclUser[]> {
    try {
      const response = await fetchApi(
        `${
          Scx.API_BASE
        }/scipherx/entity-management/entities/search?keyword=${encodeURIComponent(
          keyword
        )}`,
        {
          authRequired: true,
        },
        this.auth
      );
      return await response.json();
    } catch (error) {
      console.error("Error reading acl readers", error);
      throw new Error("Failed to read acl readers");
    }
  }
}
