import { userEvent, within } from "@storybook/testing-library";
import { contentColorsByName } from "../../../utils/colors-vars-map";
import { resetFocus } from "../../../__tests__/interactions-helper";
import { ComponentDefaultTestId } from "../../../tests/constants";
import { typeMultipleTimes, interactionSuite } from "../../../tests/interactions-utils";
import { expect } from "@storybook/jest";
import { getTestId } from "../../../tests/test-ids-utils";

async function selectAndResetWithKeyboard(canvas) {
  await clickOnColor(canvas, contentColorsByName.BRIGHT_GREEN);
  await expectColorToBeSelected(canvas, contentColorsByName.BRIGHT_GREEN);

  //move to a color in the last row
  await typeMultipleTimes("{arrowDown}", 7);
  await expectColorToBeActive(canvas, contentColorsByName.STEEL);

  //move to a color in the last row
  await userEvent.keyboard(" ");
  await expectColorToBeActive(canvas, contentColorsByName.STEEL);
  await expectColorToBeSelected(canvas, contentColorsByName.STEEL);
  await expectColorToBeNotSelected(canvas, contentColorsByName.BRIGHT_GREEN);

  //move to the "Clear color" button
  await userEvent.keyboard("{arrowDown}");
  await expectColorToBeNotActive(canvas, contentColorsByName.STEEL);
  await userEvent.keyboard("{Enter}");
  await expectColorToBeNotSelected(canvas, contentColorsByName.STEEL);
}

export const noColorInteractionSuite = interactionSuite({
  tests: [selectAndResetWithKeyboard],
  afterEach: async () => {
    await resetFocus();
  }
});

async function selectMultiColorsWithKeyboardAndMouse(canvas) {
  await clickOnColor(canvas, contentColorsByName.DARK_PURPLE);
  await expectColorToBeSelected(canvas, contentColorsByName.DARK_PURPLE);

  //move with keyboard to a different color
  await typeMultipleTimes("{arrowRight}", 3);
  await expectColorToBeActive(canvas, contentColorsByName.INDIGO);

  //select this color as well
  await userEvent.keyboard("{Enter}");
  await expectColorToBeSelected(canvas, contentColorsByName.DARK_PURPLE);
  await expectColorToBeSelected(canvas, contentColorsByName.INDIGO);
  await expectColorToBeActive(canvas, contentColorsByName.INDIGO);

  //cancel the selection of the first color
  await clickOnColor(canvas, contentColorsByName.DARK_PURPLE);
  await expectColorToBeNotSelected(canvas, contentColorsByName.DARK_PURPLE);
  await expectColorToBeSelected(canvas, contentColorsByName.INDIGO);

  //since we used the mouse, the "active" indicator should be removed
  await expectColorToBeNotActive(canvas, contentColorsByName.DARK_PURPLE);
  await expectColorToBeNotActive(canvas, contentColorsByName.INDIGO);
}

export const multiSelectionInteractionSuite = interactionSuite({
  tests: [selectMultiColorsWithKeyboardAndMouse],
  afterEach: async () => {
    await resetFocus();
  }
});

async function clickOnColor(canvas, color) {
  const element = await findColorItem(canvas, color);
  const toClick = await within(element).findByLabelText(color);
  await userEvent.click(toClick);
}

async function expectColorToBeSelected(canvas, color) {
  const element = await findColorItem(canvas, color);
  expect(element.getAttribute("class")).toContain("selectedColor");
}

async function expectColorToBeNotSelected(canvas, color) {
  const element = await findColorItem(canvas, color);
  expect(element.getAttribute("class")).not.toContain("selectedColor");
}

async function expectColorToBeActive(canvas, color) {
  const element = await findColorItem(canvas, color);
  expect(element.getAttribute("class")).toContain("active");
}

async function expectColorToBeNotActive(canvas, color) {
  const element = await findColorItem(canvas, color);
  expect(element.getAttribute("class")).not.toContain("active");
}

async function findColorItem(canvas, color) {
  return await canvas.findByTestId(getTestId(ComponentDefaultTestId.COLOR_PICKER_ITEM, color));
}
