(define (problem hero-problem) 
(:domain heroes-world) 
(:objects p0 p1 p2 p4 p5 p6 p7 p8  - location 
h - hero 
m00  - m0 
w0 - w0 
) 
(:init (at h p0) (at m00 p2) (guarded p2) 
(at w0 p1) 
(adjacent p0 p1) 
(adjacent p1 p4) 
(adjacent p1 p0) 
(adjacent p1 p2) 
(adjacent p2 p5) 
(adjacent p2 p1) 
(adjacent p4 p1) 
(adjacent p4 p7) 
(adjacent p4 p5) 
(adjacent p5 p2) 
(adjacent p5 p8) 
(adjacent p5 p4) 
(adjacent p6 p7) 
(adjacent p7 p4) 
(adjacent p7 p6) 
(adjacent p7 p8) 
(adjacent p8 p5) 
(adjacent p8 p7) 
) (:goal (and (has-castle p2) )))