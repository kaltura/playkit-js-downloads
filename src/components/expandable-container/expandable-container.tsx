import {h, ComponentChildren, Fragment} from 'preact';
import {useState} from 'preact/hooks';
import * as styles from './expandable-container.scss';
import {A11yWrapper} from '@playkit-js/common';

interface ExpandableContainerProps {
  defaultItem: ComponentChildren;
  restOfItems: ComponentChildren | undefined;
  showMoreLabel: string;
  showLessLabel: string;
}

export const ExpandableContainer = (props: ExpandableContainerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const _onClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Fragment>
      {props.defaultItem}
      {isExpanded && props.restOfItems}
      <A11yWrapper onClick={_onClick}>
        <div className={styles.expandableLabel} tabIndex={0}>
          {isExpanded ? props.showLessLabel : props.showMoreLabel}
        </div>
      </A11yWrapper>
    </Fragment>
  );
};
