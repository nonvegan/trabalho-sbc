:-[search].
:- dynamic(initial/1).
:- dynamic(goal/1).
:- dynamic(road/3).
:- dynamic(s/2).

% travel(City1,City2,distance):
travel(X,Y,KM):-(road(X,Y,KM);road(Y,X,KM)). % true if road or symmetrical

% state transition rule s/2: s(City1,City2)

% evaluation function: (sum of distances for all pairs)
eval([_],0).
eval([City1,City2|R],DS):- 
	travel(City1,City2,D),
	eval([City2|R],DR),
	DS is D+DR.

evalLucro([],0). %eval lucro
evalLucro([City|R],DS):- 
	lucro(City,D),
	evalLucro(R,DR),
	DS is D+DR.