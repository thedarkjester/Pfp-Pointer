// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

library AddressUtils {

  function isContract(address _addr) internal view returns (bool)
  {
    uint size;
    assembly { size := extcodesize(_addr)}
    return size > 0;
  }

  function isEOA(address _addr) internal view returns (bool)
  {
    uint size;
    assembly { size := extcodesize(_addr)}
    return (size == 0 && _addr.balance > 0);
  }
}

library BytesUtils {
   function returnFailure(bytes memory data) internal pure {
        if (data.length > 0){
            assembly {
              let data_size := mload(data)
              revert(add(32, data), data_size)
            }
        }
        else{
              revert("Function call reverted");
        }
    }

    function decodeToString(bytes memory data) internal pure returns (string memory){
        return abi.decode(data, (string));
    }

    function decodeToBool(bytes memory data) internal pure returns (bool){
        return abi.decode(data, (bool));
    }

    function decodeToUint256(bytes memory data) internal pure returns (uint256){
        return abi.decode(data, (uint256));
    }

     function decodeToAddress(bytes memory data) internal pure returns (address){
        return abi.decode(data, (address));
    }
}
