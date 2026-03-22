/**
 * Mongoose Plugin to automatically convert string booleans to actual booleans
 * This prevents MongoDB casting errors at the model level
 * 
 * Usage: Add this plugin to any schema with boolean fields
 * schema.plugin(booleanConverterPlugin);
 */

/**
 * Plugin function that adds pre-save hook to convert string booleans
 */
export function booleanConverterPlugin(schema) {
    // Get all boolean fields from the schema
    const booleanFields = [];

    schema.eachPath((pathname, schematype) => {
        if (schematype.instance === 'Boolean') {
            booleanFields.push(pathname);
        }
    });

    // Add pre-save hook to convert string booleans
    schema.pre('save', function (next) {
        booleanFields.forEach(field => {
            const value = this.get(field);

            if (typeof value === 'string') {
                const lowerValue = value.toLowerCase().trim();
                this.set(field, lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes');
            } else if (typeof value === 'number') {
                this.set(field, value !== 0);
            }
        });

        next();
    });

    // Add pre-update hook for findOneAndUpdate, updateOne, etc.
    schema.pre('findOneAndUpdate', function (next) {
        const update = this.getUpdate();

        if (update && update.$set) {
            booleanFields.forEach(field => {
                const value = update.$set[field];

                if (value !== undefined && typeof value === 'string') {
                    const lowerValue = value.toLowerCase().trim();
                    update.$set[field] = lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
                } else if (value !== undefined && typeof value === 'number') {
                    update.$set[field] = value !== 0;
                }
            });
        }

        next();
    });
}

export default booleanConverterPlugin;
