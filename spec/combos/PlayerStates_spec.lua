local PlayerStates = require("invokation.combos.PlayerStates")

describe("PlayerStates", function()
  describe("#__index", function()
    it("creates a new player state if it doesn't exist yet", function()
      local player1 = { GetPlayerID = spy.new(function()
        return 1
      end) }

      local player2 = { GetPlayerID = spy.new(function()
        return 2
      end) }

      local states = PlayerStates()

      assert.is_nil(states.states[1])

      local state1 = states[player1]

      assert.are.same({}, state1)
      assert.are.equal(states.states[1], state1)
      assert.spy(player1.GetPlayerID).was_called(1)

      assert.is_nil(states.states[2])

      local state2 = states[player2]

      assert.are.same({}, state2)
      assert.are.equal(states.states[2], state2)
      assert.spy(player2.GetPlayerID).was_called(1)

      assert.are_not.equal(state1, state2)
    end)

    it("returns a previously created state", function()
      local player = { GetPlayerID = spy.new(function()
        return 1
      end) }

      local states = PlayerStates()

      assert.is_nil(states.states[1])

      local state1 = states[player]

      assert.are.same({}, state1)
      assert.are.equal(states.states[1], state1)
      assert.spy(player.GetPlayerID).was_called(1)

      player.GetPlayerID:clear()

      local state2 = states[player]

      assert.are.same({}, state2)
      assert.are.equal(state1, state2)
      assert.are.equal(states.states[1], state2)
      assert.spy(player.GetPlayerID).was_called(1)

      state2.key1 = "value"

      assert.are.equal("value", state1.key1)

      player.GetPlayerID:clear()

      local state3 = states[player]

      assert.are.same({ key1 = "value" }, state3)
      assert.are.equal(state1, state2, state3)
      assert.are.equal(states.states[1], state3)
      assert.spy(player.GetPlayerID).was_called(1)

      state3.key2 = 13

      assert.are.same(
        {
          key1 = "value",
          key2 = 13,
        },
        state1
      )

      assert.are.same(
        {
          key1 = "value",
          key2 = 13,
        },
        state2
      )

      assert.are.same(
        {
          key1 = "value",
          key2 = 13,
        },
        state3
      )
    end)
  end)
end)
