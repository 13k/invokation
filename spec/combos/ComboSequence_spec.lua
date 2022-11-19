local m = require("moses")

local ComboStep = require("invokation.combos.ComboStep")
local ComboSequence = require("invokation.combos.ComboSequence")

local STATES = ComboSequence.STATES

describe("ComboSequence", function()
  local steps = {
    { id = 1, name = "step1", required = true, next = { 2, 3 } },
    { id = 2, name = "step2", next = { 3 } },
    { id = 3, name = "step3", required = true },
  }

  local clockIdx
  local function clock()
    clockIdx = clockIdx + 1
    return clockIdx
  end

  local getId = m.property("id")
  local function stepsIds(arr)
    return m.map(arr, getId)
  end

  local seq, seqId, spyClock

  before_each(function()
    clockIdx = 0
    seqId = m.uniqueId()
    spyClock = spy.new(clock)
    seq = ComboSequence(seqId, steps, { clock = spyClock })
  end)

  describe("constructor", function()
    it("initializes attributes", function()
      assert.equal(seqId, seq.id)
      assert.equal(spyClock, seq.clock)
      assert.is_table(seq.sequence)
      assert.is_true(m.all(seq.sequence, function(s)
        return ComboStep:class_of(s)
      end))
    end)
  end)

  describe("#EnterTime", function()
    it("returns the time when the sequence entered a state", function()
      assert.is_true(seq:Progress("step1"))
      assert.is_true(seq:Progress("step2"))
      assert.is_true(seq:Progress("step3"))
      assert.is_true(seq:PreFinish())
      assert.equal(4, seq:EnterTime(STATES.PRE_FINISH))
      assert.is_nil(seq:EnterTime(STATES.FINISH))
      assert.spy(seq.clock)
    end)

    it("returns nil for an invalid state", function()
      assert.is_true(seq:Progress("step1"))
      assert.is_true(seq:Progress("step2"))
      assert.is_true(seq:Progress("step3"))
      assert.is_true(seq:PreFinish())
      assert.is_true(seq:Finish())
      assert.is_nil(seq:EnterTime("invalid"))
    end)
  end)

  describe("#LeaveTime", function()
    it("returns the time when the sequence left a state", function()
      assert.is_true(seq:Progress("step1"))
      assert.is_true(seq:Progress("step2"))
      assert.is_true(seq:Progress("step3"))
      assert.is_true(seq:PreFinish())
      assert.is_true(seq:Finish())
      assert.equal(5, seq:LeaveTime(STATES.PRE_FINISH))
      assert.is_nil(seq:LeaveTime(STATES.FINISH))
    end)

    it("returns nil for an invalid state", function()
      assert.is_true(seq:Progress("step1"))
      assert.is_true(seq:Progress("step2"))
      assert.is_true(seq:Progress("step3"))
      assert.is_true(seq:PreFinish())
      assert.is_true(seq:Finish())
      assert.is_nil(seq:LeaveTime("invalid"))
    end)
  end)

  describe("#Progress", function()
    describe("with a valid event", function()
      it("progresses the sequence", function()
        assert.is_nil(seq.current)
        assert.is_nil(seq.currentId)
        assert.same({ 1 }, seq.nextIds)
        assert.same({ 1 }, stepsIds(seq.next))
        assert.is_nil(seq:EnterTime(STATES.INITIAL))
        assert.is_nil(seq:LeaveTime(STATES.INITIAL))

        assert.is_true(seq:Progress("step1"))

        assert.same(1, seq.current.id)
        assert.equal(1, seq.currentId)
        assert.same({ 2, 3 }, seq.nextIds)
        assert.same({ 2, 3 }, stepsIds(seq.next))
        assert.equal(1, seq:LeaveTime(STATES.INITIAL))

        assert.is_true(seq:Progress("step2"))

        assert.same(2, seq.current.id)
        assert.equal(2, seq.currentId)
        assert.same({ 3 }, seq.nextIds)
        assert.same({ 3 }, stepsIds(seq.next))

        assert.is_true(seq:Progress("step3"))

        assert.same(3, seq.current.id)
        assert.equal(3, seq.currentId)
        assert.same({}, seq.nextIds)
        assert.same({}, stepsIds(seq.next))

        assert.is_true(seq:PreFinish())

        assert.is_nil(seq.current)
        assert.is_nil(seq.currentId)
        assert.same({}, seq.nextIds)
        assert.same({}, stepsIds(seq.next))
        assert.equal(4, seq:EnterTime(STATES.PRE_FINISH))

        assert.is_true(seq:Finish())

        assert.is_nil(seq.current)
        assert.is_nil(seq.currentId)
        assert.same({}, seq.nextIds)
        assert.same({}, stepsIds(seq.next))
        assert.equal(5, seq:LeaveTime(STATES.PRE_FINISH))
        assert.equal(5, seq:EnterTime(STATES.FINISH))
      end)

      it("enables skipping optional steps", function()
        assert.is_nil(seq.current)
        assert.is_nil(seq.currentId)
        assert.same({ 1 }, seq.nextIds)
        assert.same({ 1 }, stepsIds(seq.next))
        assert.is_nil(seq:EnterTime(STATES.INITIAL))
        assert.is_nil(seq:LeaveTime(STATES.INITIAL))

        assert.is_true(seq:Progress("step1"))

        assert.same(1, seq.current.id)
        assert.equal(1, seq.currentId)
        assert.same({ 2, 3 }, seq.nextIds)
        assert.same({ 2, 3 }, stepsIds(seq.next))
        assert.equal(1, seq:LeaveTime(STATES.INITIAL))

        assert.is_true(seq:Progress("step3"))

        assert.same(3, seq.current.id)
        assert.equal(3, seq.currentId)
        assert.same({}, seq.nextIds)
        assert.same({}, stepsIds(seq.next))

        assert.is_true(seq:PreFinish())

        assert.is_nil(seq.current)
        assert.is_nil(seq.currentId)
        assert.same({}, seq.nextIds)
        assert.same({}, stepsIds(seq.next))
        assert.equal(3, seq:EnterTime(STATES.PRE_FINISH))

        assert.is_true(seq:Finish())

        assert.is_nil(seq.current)
        assert.is_nil(seq.currentId)
        assert.same({}, seq.nextIds)
        assert.same({}, stepsIds(seq.next))
        assert.equal(4, seq:LeaveTime(STATES.PRE_FINISH))
        assert.equal(4, seq:EnterTime(STATES.FINISH))
      end)
    end)

    describe("with an invalid event", function()
      it("does NOT progress the sequence", function()
        assert.is_false(seq:Progress("invalid"))
        assert.is_false(seq:Progress("step2"))
        assert.is_true(seq:Progress("step1"))
        assert.is_true(seq:Progress("step3"))
        assert.is_false(seq:Progress("step1"))
        assert.is_false(seq:Progress("step2"))
        assert.is_false(seq:Progress("invalid"))
      end)
    end)
  end)

  describe("#PreFinish", function()
    it("pre-finishes the sequence", function()
      assert.is_false(seq:PreFinish())
      assert.is_true(seq:Progress("step1"))
      assert.is_false(seq:PreFinish())
      assert.is_true(seq:Progress("step2"))
      assert.is_false(seq:PreFinish())
      assert.is_true(seq:Progress("step3"))
      assert.is_true(seq:PreFinish())
    end)
  end)

  describe("#Finish", function()
    it("finishes the sequence", function()
      assert.is_false(seq:Finish())
      assert.is_true(seq:Progress("step1"))
      assert.is_false(seq:Finish())
      assert.is_true(seq:Progress("step2"))
      assert.is_false(seq:Finish())
      assert.is_true(seq:Progress("step3"))
      assert.is_false(seq:Finish())
      assert.is_true(seq:PreFinish())
      assert.is_true(seq:Finish())
    end)

    it("sets the duration", function()
      assert.is_true(seq:Progress("step1"))
      assert.is_true(seq:Progress("step2"))
      assert.is_true(seq:Progress("step3"))
      assert.is_true(seq:PreFinish())
      assert.is_true(seq:Finish())
      assert.equal(4, seq.duration)
    end)
  end)
end)
