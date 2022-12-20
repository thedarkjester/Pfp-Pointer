const errorString = "VM Exception while processing transaction: ";

async function tryCatch(promise, reason) {
    try {
        await promise;
        throw null;
    }
    catch (error) {
        assert(error, "Expected a VM exception but did not get one");
        assert(error.message.includes(errorString + reason) >= 0, "Expected an error containing '" + errorString + reason + "' but got '" + error.message + "' instead");
    }
};

module.exports = {
    catchOutOfBounds       : async function(promise) {await tryCatch(promise, "value out-of-bounds (argument=\"index\", value=-1, code=INVALID_ARGUMENT, version=abi/5.6.4)");},
    catchRevert            : async function(promise) {await tryCatch(promise, "revert"             );},
    catchOutOfGas          : async function(promise) {await tryCatch(promise, "out of gas"         );},
    catchInvalidJump       : async function(promise) {await tryCatch(promise, "invalid JUMP"       );},
    catchInvalidOpcode     : async function(promise) {await tryCatch(promise, "invalid opcode"     );},
    catchStackOverflow     : async function(promise) {await tryCatch(promise, "stack overflow"     );},
    catchStackUnderflow    : async function(promise) {await tryCatch(promise, "stack underflow"    );},
    catchStaticStateChange : async function(promise) {await tryCatch(promise, "static state change");}
};