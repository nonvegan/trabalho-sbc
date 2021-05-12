% 3 depth-first methods; adapted from (Bratko, 2012)

% depthfirst( Path, Node, Solution):
%   extending the path [Node | Path] to a goal gives Solution
depthfirst( Path, Node, [Node | Path])  :-
   goal(Node).

depthfirst( Path, Node, Sol)  :-
  s(Node, Node1),
  \+ member( Node1, Path),            	% Prevent a cycle
  depthfirst( [Node | Path], Node1, Sol).

% Maxdepth depth first:
% depthfirst2( Node, Solution, Maxdepth):
%   Solution is a path, not longer than Maxdepth, from Node to a goal
depthfirst2( Node, [Node], _)  :-
   goal( Node).

depthfirst2( Node, [Node | Sol], Maxdepth)  :-
   Maxdepth > 0,
   s( Node, Node1),
   Max1 is Maxdepth - 1,
   depthfirst2( Node1, Sol, Max1).

% Iterative Deepening: Node, Solution, StartN, FinalN
iterativedeepening(Node,Solution,N,N):- 
	depthfirst2(Node,Solution,N).
iterativedeepening(Node,Solution,N,NR):- 
        %N < Maxdepth, % assure this condition when backtracking
	N1 is N+1,
        % write('n:'),write(N),nl, % verbose if needed
        iterativedeepening(Node,Solution,N1,NR).