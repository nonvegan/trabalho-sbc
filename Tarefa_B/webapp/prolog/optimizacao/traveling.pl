/*:-[hill,auxiliar]. Loaded in JavaScript @traveling.pl

 :- dynamic(road/3).
:- dynamic(lucro/2).
:- dynamic(initial/1).

road(restaurante, cliente1, 5).
road(restaurante, cliente4, 7).
road(cliente1, cliente2, 5).
road(cliente1, cliente4, 5).
road(cliente1, cliente5, 5).
road(cliente2, cliente3, 3).
road(cliente2, cliente4, 2).
road(cliente2, cliente5, 2).
road(cliente3, cliente4, 4).
road(cliente3, cliente5, 5).

lucro(restaurante,0).
lucro(cliente1,1).
lucro(cliente2,0).
lucro(cliente3,2).
lucro(cliente4,0).
lucro(cliente5,1).

travel(X,Y,D):-road(Y,X,D);road(X,Y,D). % true if dist or symmetrical */

eval_lucro([],0). %eval lucro
eval_lucro([City|R],DS):- 
	lucro(City,D),
	eval_lucro(R,DR),
	DS is D+DR.

 eval_dist([_],0). %eval dist
 eval_dist([City1,City2|R],DS):- 
	travel(City1,City2,D),
	eval_dist([City2|R],DR),
	DS is D+DR. 

hill_eval(X,Y) :- eval_lucro(X,Y). % Call the desired eval predicate here

change(S1,S2):-
	length(S1,L),
	random_between(1,2,P1),
        change(S1,P1,L,S2).

change(S1,P1,L,S2):- % Case 1, push random nearby node
	P1 = 1, % add
	nth1(L,S1,LastCity),
  findall(X,road(LastCity,X,_),L1),
	random_member(NextCity, L1),
	append(S1,[NextCity],S2).

change(S1,P1,L,S2):- % Case 2, pop node if length>1
	P1 = 2,( L>1 -> deleteLastElement(S1,S2);change(S1,1,L,S2)).

:- set_random(seed(12345)).

q1:- initial(S0),hill_climbing(S0,[10000,2000,1,max],S),eval_dist(S,D),eval_lucro(S,L),
	write('Solution: '),write(S),nl,
	write('Duracao: '),write(D),nl,
	write('Lucro: '),write(L).