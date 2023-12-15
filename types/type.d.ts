declare global {
    type RenderFunction = () => VNodeChild;
    type Nullable<T> = T | null;
    type Undefinable<T> = T | undefined;
    type Recordable<T = any> = Record<string, T>;
    type MaybeArray<T = any> = T | T[];
    type PartialNullable<T> = {
        [P in keyof T]: T[P] | null;
    };
}
