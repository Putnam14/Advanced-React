import React from 'react'
import PropTypes from 'prop-types'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import styled from 'styled-components'

const AnimationStyles = styled.span`
  position: relative;
  .count {
    display: block;
    position: relative;
    transition: all 0.4s;
    backface-visibility: hidden;
  }
  /* Initial state of the entered dot */
  /* Rotate from on back to its front */
  .count-enter {
    transform: rotateX(0.5turn); /* Turn is 360 degrees */
  }
  .count-enter-active {
    transform: rotateX(0);
  }
  /* Exit animation */
  .count-exit {
    top: 0;
    position: absolute;
    transform: rotateX(0); /* Turn is 360 degrees */
  }
  .count-exit-active {
    top: 0;
    position: absolute;
    transform: rotateX(-0.5turn);
  }
`

const Dot = styled.div`
  background: ${props => props.theme.red};
  color: white;
  border-radius: 50%;
  padding: 0.5rem;
  line-height: 2rem;
  min-width: 3rem;
  margin-left: 1rem;
  font-weight: 100;
  /* Will make it so that fat numbers don't expand the div */
  font-feature-setting: 'tnum';
  font-variant-numeric: tabular-nums;
`

const CartCount = ({ count }) => (
  <AnimationStyles>
    <TransitionGroup>
      <CSSTransition
        unmountOnExit
        className="count"
        classNames="count"
        key={count}
        timeout={{ enter: 400, exit: 400 }}
      >
        <Dot>{count}</Dot>
      </CSSTransition>
    </TransitionGroup>
  </AnimationStyles>
)

export default CartCount
