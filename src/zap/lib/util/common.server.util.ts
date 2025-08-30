import { db } from "@/db";
import { event } from "@/db/schema";
import type { Session } from "@/zap/lib/auth/client";

const USER_EVENTS_WITH_ONLY_STATUS_UPDATE = ["remove", "delete"]
export interface ModifiedFields {
    [key: string]: { old: unknown, new: unknown };
}

function identifyModifiedFields(
    original: { [key: string]: unknown },
    updated: { [key: string]: unknown },
    skipFields: string[]
): ModifiedFields {
    const modifiedFields: ModifiedFields = {};
    const skipMap = new Set(skipFields);

    for (const fieldName in original) {
        if (skipMap.has(fieldName)) {
            continue;
        }

        if (!Object.is(original[fieldName], updated[fieldName])) {

            if (original[fieldName] === undefined || original[fieldName] === undefined) {
                continue;
            }

            modifiedFields[fieldName] = {
                old: original[fieldName],
                new: updated[fieldName],
            };
        }
    }

    return modifiedFields;
}

async function generateEventDetails(
    action: string,
    primaryAffectedEntity: string,
    modifiedFields: { [key: string]: { old: unknown; new: unknown } },
    session: Session,
    otherDetails: string = ""
): Promise<string> {
    const userInSession = session.user;
    const { name: username, email: useremail, id: userid } = userInSession;
    if (action === "update" && Object.keys(modifiedFields).length > 0) {
        const logMessages = Object.entries(modifiedFields).map(
            ([fieldName, values]) => {
                const { old, new: newVal } = values;
                return `${fieldName} from ${old} to ${newVal}`;
            }
        );

        return `${primaryAffectedEntity} ${action}d by [${username}(${useremail})(${userid})]. Changes: ${logMessages.join(", ")}. ${otherDetails}`;
    } else if (USER_EVENTS_WITH_ONLY_STATUS_UPDATE.includes(action)) {
        return `${primaryAffectedEntity} ${action}d by [${username}(${useremail})(${userid})]. ${otherDetails}`;
    }

    return `${primaryAffectedEntity} ${action} triggered by [${username}(${useremail})(${userid})].${otherDetails?.trim()?.length
        ? ` ${otherDetails.trim()}`
        : ' No values were modified'
        }`;
}

export type StoreChangeLogParams = {
    action: 'update' | 'delete'
    primaryAffectedEntity: string;
    primaryAffectedEntityID: string;
    primaryOrSecAffectedTable: string;
    primaryOrSecAffectedEntityID: string;
    originalData: Record<string, unknown>;
    newData: Record<string, unknown>;
    skipFields: string[];
    session: Session;
    otherDetails?: string;
}

export async function storeChangeLog({
    action,
    primaryAffectedEntity,
    primaryOrSecAffectedTable,
    primaryOrSecAffectedEntityID,
    originalData,
    newData,
    skipFields,
    session,
    otherDetails = ""
}: StoreChangeLogParams): Promise<void> {
    const modifiedFields = identifyModifiedFields(
        originalData,
        newData,
        skipFields
    );
    const eventDetails = await generateEventDetails(
        action,
        primaryAffectedEntity,
        modifiedFields,
        session,
        otherDetails
    );

    await storeEvent(
        primaryOrSecAffectedTable,
        String(primaryOrSecAffectedEntityID),
        eventDetails,
        String(session.user.id)
    );
    return;
};

export const storeEvent = async (
    tableName: string,
    fieldId: string,
    eventDetails: string,
    eventBy: string
): Promise<void> => {
    await db.insert(event).values({
        table_name: tableName,
        field_id: fieldId,
        event_details: eventDetails,
        event_by: eventBy
    });
};