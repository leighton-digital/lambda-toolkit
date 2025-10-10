/**
 * Base interface for event messages used in the system.
 *
 * This interface defines the structure of an event message, including metadata
 * and payload data. It is intended to be extended by more specific event interfaces
 * to ensure consistency and traceability across event-driven components.
 *
 * @interface EventMessage
 *
 * @property {Object} detail - The main content of the event message.
 * @property {Object} detail.metadata - Metadata describing the event.
 * @property {number} detail.metadata.version - Version of the event schema.
 * @property {string} detail.metadata.created - ISO 8601 timestamp of when the event was created.
 * @property {string} detail.metadata.correlationId - ID used to correlate related events.
 * @property {string} detail.metadata.domain - Domain or bounded context of the event.
 * @property {string} detail.metadata.source - Originating system or service of the event.
 * @property {string} detail.metadata.tenant - Tenant identifier for multi-tenant systems.
 * @property {string} detail.metadata.type - Type of the event (e.g., "OrderCreated").
 * @property {string} detail.metadata.id - Unique identifier for the event.
 * @property {string} detail.metadata.storeId - Identifier for the store or location related to the event.
 * @property {Record<string, any>} detail.data - Payload of the event, containing domain-specific data.
 */
export interface EventMessage {
  detail: {
    metadata: {
      version: number;
      created: string;
      correlationId: string;
      domain: string;
      source: string;
      tenant: string;
      type: string;
      id: string;
      storeId: string;
    };
    // biome-ignore lint/suspicious/noExplicitAny: record usage
    data: Record<string, any>;
  };
}
