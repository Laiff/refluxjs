/**
 * Created by laiff on 01.12.14.
 */

Store.create = function(spec) {
    return StoreSpecBuilder(spec)
        .mix(Listener)
        .mix(Publisher)
        .mix(Livecycle)
        .mix(StoreMethods)
        .validate()
        .build();
};
