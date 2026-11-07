import { UserCredentails } from "@entities/userCredentials.entity.js";
import { EntitySubscriberInterface, EventSubscriber, UpdateEvent } from "typeorm";

@EventSubscriber()
export class UserCredSubscriber implements EntitySubscriberInterface<UserCredentails> {
  listenTo() {
    return UserCredentails;
  }

  beforeUpdate(event: UpdateEvent<UserCredentails>): void {
    const isPasswordUpdated = event.updatedColumns.some(
      (column) => column.propertyName === 'passwordHash',
    );

    if (isPasswordUpdated && event.entity)
      event.entity.passUpdatedAt = new Date();
  }
}
