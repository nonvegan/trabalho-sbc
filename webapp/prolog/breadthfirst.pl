% breadth first; adapted (Bratko,2012)

breadthfirst( [ [Node | Path] | _] - _, [Node | Path] )  :-
  goal( Node).

breadthfirst( [Path | Paths] - Z, Solution)  :-
  extend( Path, NewPaths),
  append( NewPaths, Z1, Z),   % Add NewPaths at end
  Paths \== Z1,               % Set of candidates not empty
  breadthfirst( Paths - Z1, Solution).

extend( [Node | Path], NewPaths)  :-
  findall( [NewNode, Node | Path],
           ( s(Node,NewNode), \+ member(NewNode, [Node | Path])),
           NewPaths).