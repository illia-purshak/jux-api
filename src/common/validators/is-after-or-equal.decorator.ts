import { registerDecorator, ValidationOptions } from "class-validator";

/**
 * Checks that a date is later than or equal to another date field of the same DTO.
 * Passes when either value is missing or not a `Date` (other validators handle that).
 *
 *   `createdFrom=2024-05-01&createdTo=2024-05-31` → ok
 *   `createdFrom=2024-05-31&createdTo=2024-05-01` → 400 "createdTo must be after or equal to createdFrom"
 *
 * Usage: `@IsAfterOrEqual("createdFrom") createdTo?: Date;`
 */
export function IsAfterOrEqual(
  property: string,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object, propertyName) => {
    registerDecorator({
      name: "isAfterOrEqual",
      target: object.constructor,
      propertyName: String(propertyName),
      constraints: [property],
      options: {
        message: `${String(propertyName)} must be after or equal to ${property}`,
        ...validationOptions,
      },
      validator: {
        validate(value: unknown, args) {
          const other = (args?.object as Record<string, unknown>)[property];
          if (!(value instanceof Date) || !(other instanceof Date)) return true;
          return value.getTime() >= other.getTime();
        },
      },
    });
  };
}
