import { moduleConnect } from '@uprtcl/micro-orchestrator';
import { LitElement, html, query, property } from 'lit-element';
import { ApolloClient, gql } from 'apollo-boost';

import { Agent } from 'holochain-profiles';
import { Dialog } from '@material/mwc-dialog';
import { ApolloClientModule } from '@uprtcl/graphql';

import { MutualCreditBindings } from '../bindings';
import { GetAllowedCreditors } from '../types';
import { sharedStyles } from './sharedStyles';
import { MCCreateOffer } from './hcmc-create-offer';

export class MCAllowedCreditorList extends moduleConnect(LitElement) {
  @query('#create-offer-dialog')
  createOfferDialog!: MCCreateOffer;

  @property({ type: Object })
  selectedCreditor: Agent | undefined = undefined;

  @property({ type: Array })
  agents: Agent[] | undefined = undefined;

  client!: ApolloClient<any>;

  static get styles() {
    return sharedStyles;
  }

  async firstUpdated() {
    this.client = this.request(ApolloClientModule.bindings.Client);

    const getAllowedCreditors: GetAllowedCreditors = this.request(
      MutualCreditBindings.ValidAgentFilter
    );

    const agents = await getAllowedCreditors(this.client);

    const result = await this.client.query({
      query: gql`
        {
          me {
            id
          }
        }
      `,
    });

    this.agents = agents.filter((a) => a.id !== result.data.me.id);
  }

  renderCreateOffer() {
    return html`
      <hcmc-create-offer
        id="create-offer-dialog"
        .creditor=${this.selectedCreditor}
        @offer-created=${() => (this.createOfferDialog.open = false)}
      >
      </hcmc-create-offer>
    `;
  }

  renderAgent(agent: Agent) {
    return html`
      <div class="row" style="align-items: center;">
        <mwc-list-item style="flex: 1;" twoline noninteractive graphic="avatar">
          <span>@${agent.username}</span>
          <span slot="secondary">${agent.id}</span>
          <mwc-icon slot="graphic">person</mwc-icon>
        </mwc-list-item>

        <mwc-button
          label="Offer credits"
          style="padding-right: 16px;"
          outlined
          @click=${() => {
            this.selectedCreditor = agent;
            this.createOfferDialog.open = true;
          }}
        >
          <mwc-icon style="padding-top: 3px;" slot="trailingIcon">send</mwc-icon>
        </mwc-button>
      </div>
    `;
  }

  render() {
    return html`<div class="column center-content">
      ${this.renderContent()}
    </div>`;
  }

  renderContent() {
    if (!this.agents)
      return html`<div class="padding center-content">
        <mwc-circular-progress></mwc-circular-progress>
      </div>`;

    if (this.agents.length === 0)
      return html`<div class="padding">
        <span>There are no agents to which to offer credits</span>
      </div>`;

    return html`
      ${this.renderCreateOffer()}
      <mwc-list style="width: 100%;">
        ${this.agents.map(
          (agent, i) => html`${this.renderAgent(agent)}
          ${this.agents && i < this.agents.length - 1
            ? html`<li divider padded role="separator"></li> `
            : html``} `
        )}
      </mwc-list>
    `;
  }
}
