// -----------------------------------------------------------------------------
// Purpose: Transform entrypoint
// this is the entrypoint that will be called when the transformer is invoked
// to transform an event, the return value of this function will be passed to
// the read model adapter.
// -----------------------------------------------------------------------------
interface Input<T = any> {
  eventId: string;
  validTime: string;
  eventType: string;
  aggregator: string;
  payload: T;
}

export default async function (input: Input) {
  console.info(
    `Received event ${input.eventId} with payload ${JSON.stringify(
      input.payload,
    )} and valid time ${input.validTime}`,
  );
  console.info(
    `The aggregator is ${input.aggregator}, the event type is ${input.eventType} and the contact has contactid=${input.payload.contactid}`,
  );
  const suffix = process.env.FLOWCORE_SUFFIX ?? "";
  console.info(
    `The suffix is ${suffix}`,
  );
  if (input.aggregator === "contact" + suffix) {
    if (input.eventType === "delete" + suffix) {
      return {
        contactid: input.payload.contactid,
      };
    }
    // If there is no contactid, then the event should be ignored
    if (!input.payload.contactid) {
      return null;
    }
  }
  if (input.aggregator === "organization" + suffix) {
    if (input.eventType === "delete" + suffix) {
      return {
        organizationid: input.payload.organizationid,
      };
    }
    // If there is no organizationid, then the event should be ignored
    if (!input.payload.organizationid) {
      return null;
    }
  }
  if (input.aggregator === "tenancy" + suffix) {
    if (input.eventType === "delete" + suffix) {
      return {
        tenancyid: input.payload.tenancyid,
      };
    }
    // The event should be ignored, unless both the tenancyid, organizationid and contactid are present
    if (
      !input.payload.tenancyid ||
      !input.payload.organizationid ||
      !input.payload.contactid
    ) {
      return null;
    }
  }
  return {
    eventid: input.eventId,
    validtime: input.validTime,
    ...input.payload,
  };
}
