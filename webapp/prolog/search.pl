% Paulo Cortez 2021@
:-[depthfirst,breadthfirst]. % consult all search types

% search method: generic for different search methods
% Method - search method, one of: depthfirst, depthfirst2, iterativedeepening, breadthfirst
% Par - any parameters associated with the search method. The current parameters are:
%       Maxdepth for depthfirst2 or iterativedeepening
% Solution - list with the path of states from initial to goal.
% Moves - list with transitions from initial to goal.

% first variant, transition with the Move: s(S1,Move,S2) is defined (arity of /3) and shows 
% the final Solution and Moves, executing a reverse on the original solution.
% use this method if you define transition:
search(Method,Par,Solution,Moves):- 
	initial(S0),
	execute(Method,Par,S0,Solution1),
	ifreverseneeded(Method,Solution1,Solution),
        get_moves(Solution,Moves).

% second variant, no Move transition is defined, 
% use this method if only s(S1,S2) is defined:
search(Method,Par,Solution):- 
       initial(S0),
       execute(Method,Par,S0,Solution1),
       ifreverseneeded(Method,Solution1,Solution).

% third option, no Move transition is defined, no reverse is executed, 
%search3(Method,Par,Solution):- 
%        initial(S0),
%	execute(Method,Par,S0,Solution).

% depthfirst2 and iterativedeepening do not need a reverse:
ifreverseneeded(depthfirst2,S,S):-!.        % cut is needed because of backtracking
ifreverseneeded(iterativedeepening,S,S):-!. % cut is needed because of backtracking
ifreverseneeded(_,S,S1):- reverse(S,S1). % other methods

% get all moves for a particular solution:
% assuming that a particular Solution was found, 
% returns Moves - the list of actions/moves to result in this Solution:
get_moves([_],[]).
get_moves([N1,N2|RN],[Move|RM]):- 
	s(N1,Move,N2), 
	get_moves([N2|RN],RM).

% links execute with the type of search method used:
execute(depthfirst,_,Node,Solution):- 
	depthfirst([],Node,Solution).
execute(depthfirst2,Maxdepth,Node,Solution):- 
	depthfirst2(Node,Solution,Maxdepth).
% returns N, which is found by iterativedeepening
execute(iterativedeepening,N,Node,Solution):- 
	iterativedeepening(Node,Solution,1,N). 
execute(breadthfirst,_,Start,Solution):- 
	breadthfirst([ [Start] | Z] - Z,Solution).
