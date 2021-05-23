% hill climbing (standard and stochastic versions) 
% Paulo Cortez @2021
% assumes that eval(Solution,Result) and change(S1,S2) are defined
% best solution achieved so far is stored in a special dynamic fact:
:- dynamic(hbest_sofar/2).

% internal auxiliary rules, used to update hbest_sofar:
update_hbest(S,E,Opt):-	hbest_sofar(SB,EB),
                    	best_opt(0,Opt,S,E,SB,EB,SR,ER),
                        retract(hbest_sofar(SB,EB)),assertz(hbest_sofar(SR,ER)).

% return SR,ER the best value of S1 and S2:
best(Prob,Opt,S1,E1,S2,E2,SR,ER):- 
	hill_eval(S2,E2),
        update_hbest(S2,E2,Opt), % update hbest_sofar if needed
	best_opt(Prob,Opt,S1,E1,S2,E2,SR,ER).

best_opt(Prob,_,_,_,S2,E2,S2,E2):- 
	random(X), % random from 0 to 1,
	X< Prob. % accept new solution
	
best_opt(_,Opt,S1,E1,S2,E2,SR,ER):- % else, select the best one
    ((Opt=max,max_list([E1,E2],ER));(Opt=min,min_list([E1,E2],ER))),
    ((ER==E1,SR=S1); (ER==E2,SR=S2)).


% hill climbing
% Prob=0 is pure hill climbing, Prob>0 means Stochastic Hill Climbing
% S0 is the initial solution, 
% Control is a list with the number of iterations, 
% verbose in console, probability and type of optimization.
% ---
% more detail about Control:
% Iter -- the maximum number of iterations, the algorithm stops 
%         after Iter iterations.
% Verbose -- used to show the algorithm progress, every Verbose 
%           iterations it shows current solution and evaluation.
% Prob -- numeric value from 0.0 to 1.0; 
%         if 0.0, then a pure hill climbing is performed, 
%         if > 0.0, then Stochastic Hill Climbing is executed.
% Opt -- max or min. If max then a maximization task is assumed, 
%                    if min then a minimization task is executed.

% /3 arity, main function:
hill_climbing(S0,[Iter,Verbose,Prob,Opt],SB):-
	hill_eval(S0,E0),
        retractall(hbest_sofar(_,_)), % remove any previous hbest_sofar
        assertz(hbest_sofar(S0,E0)), % update hbest_sofar
	hill_climbing(S0,E0,0,Iter,Verbose,Prob,Opt,S1),
      
        hbest_sofar(SB,EB),
				hill_eval(S1,E1).
% /8 arity, auxiliary function:
hill_climbing(S,_,Iter,Iter,_,_,_,S):-!. 
hill_climbing(S1,E1,I,Iter,Verbose,Prob,Opt,SFinal):-
	change(S1,SNew),
	best(Prob,Opt,S1,E1,SNew,_,S2,E2),
	I1 is I+1,
	hill_climbing(S2,E2,I1,Iter,Verbose,Prob,Opt,SFinal),!.
