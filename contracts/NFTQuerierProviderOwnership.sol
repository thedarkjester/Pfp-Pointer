// SPDX-License-Identifier: MIT
/*   
                                                              
T H E D A R K J E S T E R . E T H


                                        %%##%%%&                                
                           ,@@@@(     %#%%%%%%%%%&                              
                          ,&&&&@@@& %##%%%&%    ,#&                             
                          &&&&%&&&&%%#%#%%&       #                             
                         *&   %&& @% .% @&%       .,                            
                         /     & %  @#% @%&%                                    
                                  /....@/#&&                                    
                                  .../*@..%&.                                   
                                 ,    **&@&&                                    
                           *&#%%&%&&@@&&&&%&@@&@                                
                       %#####&&&&&&&&&/(&&&&&&&&&&&%%                            
                     %#######&&&&&&&#//((%&&&&&&&&&@@&&(                         
 @@# *&*   @&       &%######%&&&&&&////((((&&&&&&&&@@&&&&                        
 . .%&&&&%%@&*     &%########&&&&//////(((((#&&&&&&@@&@%@#                       
     &&&@@&@@@@@&&@&#&&%#####&&&////(((())(((&&&&&@@@@@@&                       
    &*&&&@&%@@@@@@@@@&&%#%###&#((((((()))))))))%&&&&&&@%%%                       
     &%&&&&@@@@@@@&@&&#*  ##&&#\(((#(((())))))%%&&@@&&&%%@                      
    % %*&%.%.  .*@&@#  * .#%&&&&//(# T D J ((&&&&@@@ &&&&&&&*                   
       / %*              , #%&&&&&/////((((/&&&&&&@  @&&&&&&%%%##/#/  .*&&*      
         .,                 #&&&&&&%///(((/&&&&&&&(    /&%%%&%%%%&%&%%%%@@@@@@@@,
                             @%#%%%##\%%&/&&@&@@*         &%%&%%%&%%%&%@@@@ #%@@
                            &#&&@&&&&&\&/@@@@@@@@@             *%&&%&&%&&@@   #@ 
                           ##&@&&%%%%%&&&@&@&@@&&@               %%&&%#.%  @    
                          ,#%&@&&&%#%%&&&&&&@@&&@@/             *% *%%( &       
                          .#%@@@&@%%%%&&&&&&&&&&@@.                 *%          
                          %#&@@&&@%%%%&&&&&&&&&&&&&.                 (          
                          ##&@&&&&%%%&&&&&%%&&%%&&&%                            
                          #%&@&&&&&%%&%&&&%%%%%%%%&%&                           
                         *#&&@&&&&@#@@%%&&%%%%%%%%%&%&                          
                         %&&@@&&&&&@@@@%%%%%%%%%%%%%%%&                         
                         &&&@@&&&&&@@#   %%%%%%%%%%%%%%.                        
                         &&&@@&&&&&&#     *%%%%%%%%%%%%%                        
                         .%&@@&&&&&@        %%%%%%%%%%%%%                       
                          &&@@&@@&&/         ,%%%%%%%%%%%&,                     
                           &@@@@@@&@           %%%%%%%%%%%%%                    
                           @@@@@@@@@#           (%%%%%%&%%%%%%                  
                           (&&@@@@@@@             %%%%%%&%%%%%#                 
                            @&&@@@@@&@             /%%%%%&%%%%%(                
                             &&&@@@@@@               %%%%%&&%%%%                
                             *&&&@@@@@@               %%%%%%&&%%&               
                              (&&&@@@@&@.               &%%%%%&%%%&             
                               #&&@@@@@@@                 &%%&%&%&&             
                                  @@@@@@@&@                  &&&&%%&%           
                                  &@@&&&&@ .                %&%&&%@%&&%         
                                 *&@@&&@@&&                 %%%.@&(&&@          
                             &&@&&&&@@@@@@(                 %(%#&&%(%,          
                               (#%#,                         ,,&&@&&&,  
                                                              
T H E D A R K J E S T E R . E T H
                
*/

pragma solidity 0.8.17;

interface INFTQuerierProviderOwnership{
    function getOwners() external view returns (address[] memory owners);
    function addOwner(address owner) external;
}

/// @title Manages Querier provider ownership
/// @author The Dark Jester
/// @notice You can use this contract to manage new owners for approving
/// @dev Does not include voting out
contract NFTQuerierProviderOwnership is INFTQuerierProviderOwnership{
    event OwnerAdded(address indexed owner);
    event OwnerAddedForApproval(address indexed owner);
    event OwnerApproved(address indexed owner, address approvedBy);

    uint256 constant percentageApprovalForOwners = 67;
    address[] _owners;

    mapping(address=>bool) public isOwner;
    mapping(address=>bool) public isOwnerPendingApproval;
    mapping(address=>mapping(address=>bool)) pendingOwnerVotes; 
    mapping(address=>uint256) pendingOwnerApprovalCount;

    constructor(){
         _owners.push(msg.sender);
         isOwner[msg.sender] = true;
    }

    modifier _isOwner() {
        require(isOwner[msg.sender], "Not owner");
        _;
    }

    modifier _isNotOwner(address add) {
        require(!isOwner[add], "Is owner");
        _;
    }

    function getOwners() external view returns (address[] memory owners){
         return _owners;
    }

    /// @notice Adds a new owner or proposes the new owner 
    /// @param owner New owner to add
    /// @dev Depending on threshold, owner may be added automatically
    function addOwner(address owner) _isOwner() external {
        require(!isOwner[owner], "is owner");
        require(!isOwnerPendingApproval[owner], "is pending");

        // don't need others voting
        if(_owners.length == 1){
            emit OwnerAdded(owner);
            _owners.push(owner);
            isOwner[owner] = true;
        }
        else{
            emit OwnerAddedForApproval(owner);
             // add to waiting list
             isOwnerPendingApproval[owner] = true;
             // set initial voter count
             pendingOwnerApprovalCount[owner] = 1;
             // set adder as voted
             pendingOwnerVotes[owner][msg.sender] = true;
        }
    }

    /// @notice Approves pending owner being voted for 
    /// @param owner New owner to vote for
    /// @dev Depending on threshold, owner may be added automatically. Can't double vote, or vote for owners already in.
    function approveOwner(address owner) _isNotOwner(owner) _isOwner() _hasNotApprovedOwner(owner) external  {
        emit OwnerApproved(owner, msg.sender);
        pendingOwnerApprovalCount[owner] = pendingOwnerApprovalCount[owner]+1;
        
        if((pendingOwnerApprovalCount[owner]*100/_owners.length) >= percentageApprovalForOwners){
             emit OwnerAdded(owner);
             _owners.push(owner);
             isOwner[owner] = true;
             delete isOwnerPendingApproval[owner]; // don't need it anymore
             delete pendingOwnerApprovalCount[owner];
        } 
        else{
            pendingOwnerVotes[owner][msg.sender] = true;
        }
    }

    modifier _hasNotApprovedOwner(address owner){
        require(!pendingOwnerVotes[owner][msg.sender], "is approved");
        _;
    }
}

