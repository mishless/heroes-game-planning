(define (problem hero-problem) 
(:domain heroes-world) 
(:objects p0 p1 p2 p3 p4 p5 p6 p8  - location 
h - hero 
m00  - m0 
w0 - w0 
m10  - m1 
w1 - w1 
) 
(:init (at h p2) (at m00 p0) (guarded p0) 
(at w0 p1) 
(at m10 p8) (guarded p8) 
(at w1 p4) 
(adjacent p0 p3) 
(adjacent p0 p1) 
(adjacent p1 p4) 
(adjacent p1 p0) 
(adjacent p1 p2) 
(adjacent p2 p5) 
(adjacent p2 p1) 
(adjacent p3 p0) 
(adjacent p3 p6) 
(adjacent p3 p4) 
(adjacent p4 p1) 
(adjacent p4 p3) 
(adjacent p4 p5) 
(adjacent p5 p2) 
(adjacent p5 p8) 
(adjacent p5 p4) 
(adjacent p6 p3) 
(adjacent p8 p5) 
) (:goal (and (has-castle p0) (has-castle p8) )))