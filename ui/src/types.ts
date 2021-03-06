import { Agent } from 'holochain-profiles';
import { ApolloClient, gql } from 'apollo-boost';

export const allAgentsAllowed: GetAllowedCreditors = async (client) => {
  const result = await client.query({
    query: gql`
      {
        allAgents {
          id
          username
        }
      }
    `,
  });

  return result.data.allAgents;
};

export type GetAllowedCreditors = (
  client: ApolloClient<any>
) => Promise<Agent[]>;

export interface Transaction {
  id: string;

  debtor: Agent;
  creditor: Agent;
  amount: number;
  timestamp: number;
}

export interface CounterpartySnapshot {
  valid: boolean;
  executable: boolean;
  invalidReason: string;
  balance: number;
  lastHeaderId: string;
}

export interface Counterparty {
  online: boolean;
  consented: boolean;
  snapshot?: CounterpartySnapshot;
}

export interface Offer {
  id: string;

  transaction: Transaction;
  state: string;

  counterparty: Counterparty;
}
