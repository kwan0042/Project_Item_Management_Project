export const validateFn = (validateInput) => {
    let isValide = true;
    if (validateInput.required) {
        isValide = isValide && validateInput.value.toString().trim().length !== 0;
    }
    if (validateInput.minLength != null &&
        typeof validateInput.value === "string") {
        isValide =
            isValide && validateInput.value.length > validateInput.minLength;
    }
    if (validateInput.maxLength != null &&
        typeof validateInput.value === "string") {
        isValide =
            isValide && validateInput.value.length < validateInput.maxLength;
    }
    if (validateInput.min != null && typeof validateInput.value === "number") {
        isValide = isValide && validateInput.value > validateInput.min;
    }
    if (validateInput.max != null && typeof validateInput.value === "number") {
        isValide = isValide && validateInput.value < validateInput.max;
    }
    return isValide;
};
//# sourceMappingURL=validation.js.map