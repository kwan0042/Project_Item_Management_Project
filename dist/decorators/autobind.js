export function autoBind(_, _1, descriptor) {
    const originalMethod = descriptor.value;
    const adjDescrpitor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };
    return adjDescrpitor;
}
//# sourceMappingURL=autobind.js.map