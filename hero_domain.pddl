;; Heroes of Might and Magic PDDL Domain - inspired by Jon Van Caneghem

(define (domain heroes-world)
   (:requirements :strips :typing)
   (:types hero location monster weapon - object
	dragon ogre - monster
	sword hammer - weapon)

  (:predicates  (at ?o - object ?l - location)		;; Position of an object
                (adjacent ?l1 ?l2 - location)		;; Whether two locations are connected
                (guarded ?l - location)			;; Whether the location is guarded
                (has-hammer ?h - hero)			;; Hero armed with the hammer
                (has-sword ?h - hero)			;; Hero armed with the sword

  )

   (:action move
      :parameters (?h - hero ?l1 - location ?l2 - location)
      :precondition (and (at ?h ?l1) (adjacent ?l1 ?l2) (not (guarded ?l2)))
      :effect (and (at ?h ?l2) (not (at ?h ?l1)))
   )

   (:action kill-dragon
      :parameters (?h - hero ?m - dragon ?l1 - location ?l2 - location)
      :precondition (and (at ?h ?l1) (at ?m ?l2) (adjacent ?l1 ?l2) (guarded ?l2) 
			(has-sword ?h))
      :effect (and(not (at ?m ?l2)) (not (guarded ?l2)) (at ?h ?l2) (not (at ?h ?l1)))
   )

   (:action kill-ogre
      :parameters (?h - hero ?m - ogre ?l1 - location ?l2 - location)
      :precondition (and (at ?h ?l1) (at ?m ?l2) (adjacent ?l1 ?l2) (guarded ?l2) 
			(has-hammer ?h))
      :effect (and(not (at ?m ?l2)) (not (guarded ?l2)) (at ?h ?l2) (not (at ?h ?l1)))
   )

   (:action collect-sword
      :parameters (?h - hero ?w - sword ?l1 - location)
      :precondition (and (at ?h ?l1) (at ?w ?l1))
      :effect (and (has-sword ?h) (not (at ?w ?l1)))
   )

   (:action collect-hammer
      :parameters (?h - hero ?w - hammer ?l1 - location)
      :precondition (and (at ?h ?l1) (at ?w ?l1))
      :effect (and (has-hammer ?h) (not (at ?w ?l1)))
   )
)