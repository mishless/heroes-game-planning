(define (problem hero-problem) 
(:domain heroes-world) 
(:objects p0 p2 p3 p4 p5 p6 p7 p8  - location 
h - hero 
m00  - m0 
w0 - w0 
m10  - m1 
w1 - w1 
) 
(:init (at h p3) (at m00 p8) (guarded p8) 
(at w0 p5) 
(at m10 p0) (guarded p0) 
(at w1 p2) 
(adjacent p0 p3) 
(adjacent p2 p5) 
(adjacent p3 p0) 
(adjacent p3 p6) 
(adjacent p3 p4) 
(adjacent p4 p7) 
(adjacent p4 p3) 
(adjacent p4 p5) 
(adjacent p5 p2) 
(adjacent p5 p8) 
(adjacent p5 p4) 
(adjacent p6 p3) 
(adjacent p6 p7) 
(adjacent p7 p4) 
(adjacent p7 p6) 
(adjacent p7 p8) 
(adjacent p8 p5) 
(adjacent p8 p7) 
) (:goal (and (has-castle p8) (has-castle p0) )))