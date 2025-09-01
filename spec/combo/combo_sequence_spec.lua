local assert = require("luassert")
local m = require("moses")

local MockClock = require("support.dota2.clock")
local combo_h = require("support.combo.helpers")

local ComboSequence = require("invk.combo.combo_sequence")
local ComboStep = require("invk.combo.combo_step")

local STATES = ComboSequence.STATES

describe("invk.combo.ComboSequence", function()
  local steps = {
    { id = 1, name = "step1", required = true, next = { 2, 3 } },
    { id = 2, name = "step2", next = { 3 } },
    { id = 3, name = "step3", required = true },
  }

  --- @type invk.combo.ComboSequence
  local seq
  --- @type string
  local seq_id
  --- @type support.dota2.MockClock
  local clock = MockClock()

  before_each(function()
    clock:reset()

    seq_id = m.uniqueId()
    seq = ComboSequence:new(seq_id, steps, { clock = clock })
  end)

  describe("constructor", function()
    it("initializes attributes", function()
      assert.equal(seq_id, seq.id)
      assert.equal(clock, seq.clock)
      assert.is_table(seq.sequence)

      for _, s in ipairs(seq.sequence) do
        assert.is_true(s:isInstanceOf(ComboStep))
      end
    end)
  end)

  describe(":enter_time", function()
    it("returns the time when the sequence entered a state", function()
      assert.is_true(seq:progress("step1"))
      assert.is_true(seq:progress("step2"))
      assert.is_true(seq:progress("step3"))
      assert.is_true(seq:pre_finish())
      assert.equal(4, seq:enter_time(STATES.PRE_FINISH))
      assert.is_nil(seq:enter_time(STATES.FINISH))
    end)

    it("returns nil for an invalid state", function()
      assert.is_true(seq:progress("step1"))
      assert.is_true(seq:progress("step2"))
      assert.is_true(seq:progress("step3"))
      assert.is_true(seq:pre_finish())
      assert.is_true(seq:finish())
      assert.is_nil(seq:enter_time("invalid"))
    end)
  end)

  describe(":leave_time", function()
    it("returns the time when the sequence left a state", function()
      assert.is_true(seq:progress("step1"))
      assert.is_true(seq:progress("step2"))
      assert.is_true(seq:progress("step3"))
      assert.is_true(seq:pre_finish())
      assert.is_true(seq:finish())
      assert.equal(5, seq:leave_time(STATES.PRE_FINISH))
      assert.is_nil(seq:leave_time(STATES.FINISH))
    end)

    it("returns nil for an invalid state", function()
      assert.is_true(seq:progress("step1"))
      assert.is_true(seq:progress("step2"))
      assert.is_true(seq:progress("step3"))
      assert.is_true(seq:pre_finish())
      assert.is_true(seq:finish())
      assert.is_nil(seq:leave_time("invalid"))
    end)
  end)

  describe(":progress", function()
    describe("with a valid event", function()
      it("progresses the sequence", function()
        assert.is_nil(seq.current)
        assert.is_nil(seq.current_id)
        assert.same({ 1 }, seq.next_ids)
        assert.same({ 1 }, combo_h.steps_ids(seq.next))
        assert.is_nil(seq:enter_time(STATES.INITIAL))
        assert.is_nil(seq:leave_time(STATES.INITIAL))

        assert.is_true(seq:progress("step1"))

        assert.is_not_nil(seq.current) --- @cast seq.current invk.combo.ComboStep
        assert.same(1, seq.current.id)
        assert.equal(1, seq.current_id)
        assert.same({ 2, 3 }, seq.next_ids)
        assert.same({ 2, 3 }, combo_h.steps_ids(seq.next))
        assert.equal(1, seq:leave_time(STATES.INITIAL))

        assert.is_true(seq:progress("step2"))

        assert.is_not_nil(seq.current) --- @cast seq.current invk.combo.ComboStep
        assert.same(2, seq.current.id)
        assert.equal(2, seq.current_id)
        assert.same({ 3 }, seq.next_ids)
        assert.same({ 3 }, combo_h.steps_ids(seq.next))

        assert.is_true(seq:progress("step3"))

        assert.is_not_nil(seq.current) --- @cast seq.current invk.combo.ComboStep
        assert.same(3, seq.current.id)
        assert.equal(3, seq.current_id)
        assert.same({}, seq.next_ids)
        assert.same({}, combo_h.steps_ids(seq.next))

        assert.is_true(seq:pre_finish())

        assert.is_nil(seq.current)
        assert.is_nil(seq.current_id)
        assert.same({}, seq.next_ids)
        assert.same({}, combo_h.steps_ids(seq.next))
        assert.equal(4, seq:enter_time(STATES.PRE_FINISH))

        assert.is_true(seq:finish())

        assert.is_nil(seq.current)
        assert.is_nil(seq.current_id)
        assert.same({}, seq.next_ids)
        assert.same({}, combo_h.steps_ids(seq.next))
        assert.equal(5, seq:leave_time(STATES.PRE_FINISH))
        assert.equal(5, seq:enter_time(STATES.FINISH))
      end)

      it("enables skipping optional steps", function()
        assert.is_nil(seq.current)
        assert.is_nil(seq.current_id)
        assert.same({ 1 }, seq.next_ids)
        assert.same({ 1 }, combo_h.steps_ids(seq.next))
        assert.is_nil(seq:enter_time(STATES.INITIAL))
        assert.is_nil(seq:leave_time(STATES.INITIAL))

        assert.is_true(seq:progress("step1"))

        assert.is_not_nil(seq.current) --- @cast seq.current invk.combo.ComboStep
        assert.same(1, seq.current.id)
        assert.equal(1, seq.current_id)
        assert.same({ 2, 3 }, seq.next_ids)
        assert.same({ 2, 3 }, combo_h.steps_ids(seq.next))
        assert.equal(1, seq:leave_time(STATES.INITIAL))

        assert.is_true(seq:progress("step3"))

        assert.is_not_nil(seq.current) --- @cast seq.current invk.combo.ComboStep
        assert.same(3, seq.current.id)
        assert.equal(3, seq.current_id)
        assert.same({}, seq.next_ids)
        assert.same({}, combo_h.steps_ids(seq.next))

        assert.is_true(seq:pre_finish())

        assert.is_nil(seq.current)
        assert.is_nil(seq.current_id)
        assert.same({}, seq.next_ids)
        assert.same({}, combo_h.steps_ids(seq.next))
        assert.equal(3, seq:enter_time(STATES.PRE_FINISH))

        assert.is_true(seq:finish())

        assert.is_nil(seq.current)
        assert.is_nil(seq.current_id)
        assert.same({}, seq.next_ids)
        assert.same({}, combo_h.steps_ids(seq.next))
        assert.equal(4, seq:leave_time(STATES.PRE_FINISH))
        assert.equal(4, seq:enter_time(STATES.FINISH))
      end)
    end)

    describe("with an invalid event", function()
      it("does NOT progress the sequence", function()
        assert.is_false(seq:progress("invalid"))
        assert.is_false(seq:progress("step2"))
        assert.is_true(seq:progress("step1"))
        assert.is_true(seq:progress("step3"))
        assert.is_false(seq:progress("step1"))
        assert.is_false(seq:progress("step2"))
        assert.is_false(seq:progress("invalid"))
      end)
    end)
  end)

  describe(":pre_finish", function()
    it("pre-finishes the sequence", function()
      assert.is_false(seq:pre_finish())
      assert.is_true(seq:progress("step1"))
      assert.is_false(seq:pre_finish())
      assert.is_true(seq:progress("step2"))
      assert.is_false(seq:pre_finish())
      assert.is_true(seq:progress("step3"))
      assert.is_true(seq:pre_finish())
    end)
  end)

  describe(":finish", function()
    it("finishes the sequence", function()
      assert.is_false(seq:finish())
      assert.is_true(seq:progress("step1"))
      assert.is_false(seq:finish())
      assert.is_true(seq:progress("step2"))
      assert.is_false(seq:finish())
      assert.is_true(seq:progress("step3"))
      assert.is_false(seq:finish())
      assert.is_true(seq:pre_finish())
      assert.is_true(seq:finish())
    end)

    it("sets the duration", function()
      assert.is_true(seq:progress("step1"))
      assert.is_true(seq:progress("step2"))
      assert.is_true(seq:progress("step3"))
      assert.is_true(seq:pre_finish())
      assert.is_true(seq:finish())
      assert.equal(4, seq.duration)
    end)
  end)
end)
