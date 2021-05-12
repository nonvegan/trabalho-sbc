:-[search].
:- dynamic(goal/1).
:- dynamic(road/3).

% -- database:
%   simple state representation: S, where S is a city
initial(restaurante).

% --- knowledge base:
% road(Origin,Destination,time-in-min)
/* road(restaurante,cliente1,5).
road(cliente1,restaurante,5).

road(restaurante,cliente4,7).
road(cliente4,restaurante,7).

road(cliente1,cliente4,5).
road(cliente4,cliente1,5).

road(cliente1,cliente2,5).
road(cliente2,cliente1,5).

road(cliente1,cliente5,5).
road(cliente1,cliente5,5).

road(cliente2,cliente4,2).
road(cliente4,cliente2,2).

road(cliente2,cliente3,3).
road(cliente3,cliente2,3).

road(cliente2,cliente5,2).
road(cliente5,cliente2,2).

road(cliente3,cliente4,4).
road(cliente4,cliente3,4).

road(cliente3,cliente5,5).
road(cliente5,cliente3,5). */

% travel(City1,City2,distance):
travel(X,Y,KM):-(road(X,Y,KM);road(Y,X,KM)). % true if road or symmetrical

% state transition rule s/2: s(City1,City2)
s(N1,N2):- travel(N1,N2,_). % link s(O,D,Dist) with s(O,D)

% evaluation function: (sum of distances for all pairs)
eval([_],0).
eval([City1,City2|R],DS):- 
	travel(City1,City2,D),
	eval([City2|R],DR),
	DS is D+DR.